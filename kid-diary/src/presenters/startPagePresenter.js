import { getMemoryTemplate } from '../backend/memoryTemplates.js'
import { toDayKey } from '../backend/utils/dates.js'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// The seven days (Monday to Sunday) of the week that contains `today`.
// entryDays: day keys ("2026-10-02") that already have a memory, shown highlighted.
function getWeekDays(today, entryDays) {
  const mondayOffset = (today.getDay() + 6) % 7
  return WEEKDAY_LABELS.map((label, index) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset + index)
    const isToday = day.toDateString() === today.toDateString()
    return {
      label,
      dayOfMonth: day.getDate(),
      isToday,
      hasEntry: entryDays.includes(toDayKey(day)),
    }
  })
}

// "Sunday, 4 October" (en-GB puts no comma after the weekday, so build it from parts)
function formatToday(date) {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' })
  const dayAndMonth = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  return `${weekday}, ${dayAndMonth}`
}

export function presentStartPage({ child = null, recentEntries = [], entryDays = [] } = {}) {
  return {
    childName: child?.name ?? 'Your little story',
    greeting: child ? `A little moment with ${child.name}` : 'A little moment to remember',
    recentEntries: recentEntries.map((entry) => ({ ...entry })),
    hasChild: Boolean(child),
    todayLabel: formatToday(new Date()),
    dailyChallenge: {
      tag: 'Daily challenge',
      title: getMemoryTemplate('challenge').prompt,
      startLabel: "Let's do it!",
    },
    weekTitle: 'This week',
    weekDays: getWeekDays(new Date(), entryDays),
    todaysPage: {
      title: "Today's Page is still blank",
      description: 'Add a photo, an audio, a video, or a text entry',
      addLabel: '+ Add to today',
    },
  }
}