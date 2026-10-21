import { toDayKey } from '../backend/utils/dates.js'
import { MEDIA_LABELS } from './mediaLabels.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const KIND_LABELS = { activity: 'Activity', interaction: 'Interaction', memory: 'Memory' }

// The colours a milestone block can have in the tower
const MILESTONE_COLORS = ['#FFD84D', '#8EC5FF', '#8FDDA9', '#FFB27A', '#FF9FCB', '#C3B1FF']

// "2026-10-04" -> local Date (new Date("2026-10-04") would be read as UTC)
function parseDayKey(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// One entry: the scrapbook page of one day. The items on it are scraps.
//   date:              the day of the entry, as a day key
//   page:              { entry, scraps } from the store, or null if the day has no page yet
//   media:             the photos and videos of the scraps, by media id (with an address to show them)
//   milestones:        the child's milestones, to see which scraps mark one
//   highlightScrapId:  the scrap to point out (e.g. when arriving from a milestone)
//   loaded:            false while the page is still being read
export function presentEntry({
  date,
  page = null,
  media = {},
  milestones = [],
  highlightScrapId = null,
  loaded = true,
}) {
  const day = parseDayKey(date)
  const isToday = date === toDayKey()
  const milestoneByScrapId = new Map(milestones.filter((m) => m.scrapId).map((m) => [m.scrapId, m]))
  const scraps = page?.scraps ?? []

  const items = scraps.map((scrap, index) => {
    const milestone = milestoneByScrapId.get(scrap.id)
    return {
      id: scrap.id,
      kind: scrap.kind,
      label: milestone ? 'Milestone' : KIND_LABELS[scrap.kind],
      text: scrap.text,
      media: scrap.mediaIds.map((id) => media[id]).filter(Boolean),
      isMilestone: Boolean(milestone),
      milestoneTitle: milestone?.title ?? null,
      isHighlighted: scrap.id === highlightScrapId,
      canMoveUp: index > 0,
      canMoveDown: index < scraps.length - 1,
    }
  })

  return {
    date,
    entryId: page?.entry.id ?? null,
    // the date on two rows: the weekday above, the day and month below
    weekdayLabel: WEEKDAYS[day.getDay()],
    dayLabel: `${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`,
    blank: {
      title: isToday ? "Today's page is still blank" : 'This page is still blank',
      hint: 'Add a photo, a word or a little story.',
      addLabel: 'Add a memory',
    },
    isEmpty: loaded && items.length === 0,
    scraps: items,
    stickers: (page?.entry.stickers ?? []).map((sticker) => ({ ...sticker })),
  }
}

// The open book: two entries side by side (the left page and the right page), what the
// corners turn to, and the words and choices shared by the pages.
//   left, right:           the entries from presentEntry (right is null when there is no page)
//   previousDate, nextDate: the day shown on the left page after turning back / forward (or null)
export function presentSpread({ left, right = null, previousDate = null, nextDate = null }) {
  return {
    left,
    right,
    turn: {
      previous: { label: 'Previous page', date: previousDate },
      next: { label: 'Next page', date: nextDate },
    },
    labels: {
      editEntry: 'Edit entry',
      editing: 'Editing',
      done: 'Done',
      tools: { text: 'Text', stickers: 'Stickers', photo: 'Photo', audio: 'Audio' },
      addToMilestone: 'Add to milestone',
      removeFromMilestones: 'Remove from milestones',
      editScrap: 'Edit scrap',
      deleteScrap: 'Delete scrap',
      confirmDelete: 'Delete it?',
      keep: 'Keep',
      moveUp: 'Move up',
      moveDown: 'Move down',
      removeSticker: 'Remove sticker',
    },
    mediaLabels: MEDIA_LABELS,
    milestoneColors: MILESTONE_COLORS,
    kinds: Object.entries(KIND_LABELS).map(([id, label]) => ({ id, label })),
  }
}
