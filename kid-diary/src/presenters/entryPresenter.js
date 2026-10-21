import { toDayKey } from '../backend/utils/dates.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const KIND_LABELS = { activity: 'Activity', interaction: 'Interaction', memory: 'Memory' }

// "2026-10-04" -> local Date (new Date("2026-10-04") would be read as UTC)
function parseDayKey(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// An entry is the page of one day; the items on it are scraps.
//   date:              the day of the entry, as a day key
//   storedScraps:      the entry's scraps from the store (the text scraps are shown from here)
//   uploads:           photos and videos added this session (shown on today's page)
//   milestoneScrapIds: scraps that a milestone marks
//   highlightScrapId:  the scrap to point out (e.g. when arriving from a milestone)
//   neighbours:        the days before and after this one, for the page-turning corners
// The open book shows two facing pages, so the scraps are shared between them:
// the 1st, 3rd, ... go on the left page and the 2nd, 4th, ... on the right.
export function presentEntry({
  date = toDayKey(),
  storedScraps = [],
  uploads = [],
  milestoneScrapIds = [],
  highlightScrapId = null,
  neighbours = { previous: null, next: null },
  loaded = true,
} = {}) {
  const day = parseDayKey(date)
  const isToday = date === toDayKey()
  const milestoneIds = new Set(milestoneScrapIds)

  // Scraps that hold a photo or video are shown from `uploads`, so only text scraps come from the store.
  const textScraps = storedScraps
    .filter((scrap) => scrap.mediaIds.length === 0)
    .map((scrap) => ({
      id: scrap.id,
      type: 'text',
      kind: scrap.kind,
      label: milestoneIds.has(scrap.id) ? 'Milestone' : KIND_LABELS[scrap.kind],
      text: scrap.text,
      isMilestone: milestoneIds.has(scrap.id),
      isHighlighted: scrap.id === highlightScrapId,
    }))

  const mediaScraps = (isToday ? uploads : []).map((upload) => ({
    ...upload,
    type: 'media',
    deleteLabel: `Delete ${upload.kind}`,
  }))

  const items = [...textScraps, ...mediaScraps]

  return {
    dateLabel: `${WEEKDAYS[day.getDay()]}, ${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`,
    blank: {
      title: isToday ? "Today's page is still blank" : 'This page is still blank',
      hint: 'Add a photo, a word or a little story.',
      addLabel: 'Add a memory',
    },
    isEmpty: loaded && items.length === 0,
    turn: {
      previous: { label: 'Previous page', date: neighbours.previous },
      next: { label: 'Next page', date: neighbours.next },
    },
    leftScraps: items.filter((_, index) => index % 2 === 0),
    rightScraps: items.filter((_, index) => index % 2 === 1),
  }
}
