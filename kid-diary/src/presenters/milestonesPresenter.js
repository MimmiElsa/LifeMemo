const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 24 * 60 * 60 * 1000

// Slightly different widths, shifts and tilts so the tower looks hand-stacked
const WIDTHS = [350, 320, 330, 300, 310, 290, 320, 300, 335, 305, 295, 315]
const SHIFTS = [0, 12, -10, 8, -6, 14, -8, 6, -12, 10, -4, 8]
const TILTS = [0, -1, 1, -1.5, 1, -0.5, 1.5, -1, 0.5, -1, 1, -0.5]

// "2025-04-03" -> local Date (new Date("2025-04-03") would be read as UTC)
function parseDayKey(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function daysBetween(from, to) {
  return Math.round((to - from) / DAY_MS)
}

function formatDate(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// Whole months from `from` to `to` (a month only counts once its day has arrived)
function fullMonthsBetween(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months -= 1
  return months
}

// "7 weeks", "9 months", "1 year", "2½ years", or "in 50 days" for the future
function ageLabel(birthday, date, today) {
  if (date > today) {
    const days = daysBetween(today, date)
    return days === 1 ? 'tomorrow' : `in ${days} days`
  }
  if (!birthday) return ''

  const born = parseDayKey(birthday)
  const days = daysBetween(born, date)
  if (days <= 0) return 'Day one'

  const months = fullMonthsBetween(born, date)
  const isAnniversary = months > 0 && months % 12 === 0 && date.getDate() === born.getDate()

  if (isAnniversary) {
    const years = months / 12
    return `${years} year${years === 1 ? '' : 's'}`
  }
  if (months < 3) return `${Math.floor(days / 7)} weeks`
  if (months < 24) return `${months} months`

  const roundedMonths = Math.round(days / 30.44)
  const years = Math.floor(roundedMonths / 12)
  return roundedMonths % 12 >= 6 ? `${years}½ years` : `${years} years`
}

export function presentMilestones({ child = null, today = new Date() } = {}) {
  const now = startOfDay(today)
  const milestones = child?.milestones ?? []

  // Oldest first, so each block keeps the same look when new ones are added on top
  const sorted = milestones
    .map((milestone) => ({ milestone, date: parseDayKey(milestone.date) }))
    .sort((a, b) => a.date - b.date)

  const blocks = sorted.map(({ milestone, date }, index) => {
    const isUpcoming = date > now
    const isSuggested = milestone.source === 'suggested'
    return {
      type: 'block',
      id: milestone.id,
      title: milestone.title,
      date: milestone.date,
      scrapId: milestone.scrapId ?? null,
      dateLabel: formatDate(date),
      ageLabel: ageLabel(child?.birthday, date, now),
      isUpcoming,
      isSuggested,
      isUserAdded: !isSuggested,
      color: milestone.color,
      // dates alternate left and right of the tower
      side: index % 2 === 0 ? 'left' : 'right',
      width: isUpcoming ? 270 : WIDTHS[index % WIDTHS.length],
      shift: isUpcoming ? 0 : SHIFTS[index % SHIFTS.length],
      tilt: isUpcoming ? 0 : TILTS[index % TILTS.length],
    }
  })

  // Top to bottom: upcoming (newest first), the "today" line, then achieved (newest first)
  const upcoming = blocks.filter((block) => block.isUpcoming).reverse()
  const achieved = blocks.filter((block) => !block.isUpcoming).reverse()
  const todayRow = {
    type: 'today',
    id: 'today',
    label: `Today · ${now.getDate()} ${MONTHS[now.getMonth()]}`,
  }

  return {
    pageLabel: 'Milestones',
    pageTitle: child ? `${child.name}’s tower` : 'Your tower',
    legend: {
      suggested: 'Suggested by Life Memo',
      userAdded: 'Added by you',
    },
    addLabel: 'Add milestone',
    newerLabel: 'Newer milestones',
    olderLabel: 'Older milestones',
    emptyLabel: 'No milestones yet — add the first block of the tower.',
    isEmpty: blocks.length === 0,
    rows: [...upcoming, todayRow, ...achieved],
  }
}
