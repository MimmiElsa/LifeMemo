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

// Every cell of the month grid, Sunday first, including the faded days of the
// neighbouring months that fill the first and last week.
// month is 1-12.
function buildCells({ year, month, days, selectedDate, todayKey }) {
  const daysByDate = new Map(days.map((day) => [day.date, day]))
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const weekCount = Math.ceil((firstWeekday + daysInMonth) / 7)

  return Array.from({ length: weekCount * 7 }, (_, index) => {
    const date = new Date(year, month - 1, 1 - firstWeekday + index)
    const dayKey = toDayKey(date)
    const inMonth = date.getMonth() === month - 1
    const day = inMonth ? daysByDate.get(dayKey) : undefined

    return {
      date: dayKey,
      dayOfMonth: date.getDate(),
      inMonth,
      isToday: dayKey === todayKey,
      isSelected: dayKey === selectedDate,
      hasEntry: Boolean(day),
      mood: day?.mood ?? null,
      count: day?.count ?? 0,
    }
  })
}

// year is the full year, month is 1-12.
// days: [{ date, count, mood }] from getDaysWithEntries
// details: { entry, scraps } from getDayDetails, or null when the day is empty
export function presentCalendar({
  child = null,
  year,
  month,
  days = [],
  selectedDate = null,
  details = null,
  milestoneScrapIds = [],
  today = new Date(),
} = {}) {
  const childName = child?.name ?? 'your child'
  const monthName = MONTHS[month - 1]
  const selected = selectedDate ? parseDayKey(selectedDate) : null
  const milestoneIds = new Set(milestoneScrapIds)

  return {
    monthName,
    yearLabel: String(year),
    previousLabel: 'Previous month',
    nextLabel: 'Next month',
    weekdayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cells: buildCells({ year, month, days, selectedDate, todayKey: toDayKey(today) }),
    legend: `Colours show how ${childName} felt`,

    summary: {
      eyebrow: 'Monthly summary',
      title: `See ${monthName} as a scrapbook`,
      openLabel: 'Open',
    },

    day: selected && {
      date: selectedDate,
      weekday: WEEKDAYS[selected.getDay()],
      dateLabel: `${selected.getDate()} ${MONTHS[selected.getMonth()]}`,
      hasEntry: Boolean(details),
      scraps: (details?.scraps ?? []).map((scrap) => ({
        id: scrap.id,
        kind: scrap.kind,
        label: milestoneIds.has(scrap.id) ? 'Milestone' : KIND_LABELS[scrap.kind],
        isMilestone: milestoneIds.has(scrap.id),
        text: scrap.text || 'Photo or video',
      })),
      emptyLabel: 'Nothing added on this day yet.',
      viewEntryLabel: 'View entry',
    },
    placeholder: 'Pick a day to see what happened.',
  }
}
