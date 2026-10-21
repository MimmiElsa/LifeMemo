// Issue #2 – Calendar
//
// The calendar screen asks two questions:
//   1. "Which days in this month have scraps?"   -> to mark those days
//   2. "What happened on this day?"              -> when a day is tapped

import { getMonthRange } from '../utils/dates.js'
import { getEntriesBetween, getScrapsForEntry } from './entries.js'

// Days in a month that have a page with at least one scrap or a mood, with how many scraps
// and how the child felt (the entry's mood, or null).
// Month is 1–12 (1 = January).
// getDaysWithEntries('abc', 2026, 10)
//   -> [{ date: '2026-10-03', count: 1, mood: 'happy' }, { date: '2026-10-15', count: 2, mood: null }]
export async function getDaysWithEntries(childId, year, month) {
  const { start, end } = getMonthRange(year, month)
  const entries = await getEntriesBetween(childId, start, end)

  // Entries are already sorted by date, so the days come out in order.
  const days = []
  for (const entry of entries) {
    const scraps = await getScrapsForEntry(entry.id)
    if (scraps.length > 0 || entry.mood) days.push({ date: entry.date, count: scraps.length, mood: entry.mood ?? null })
  }
  return days
}

// The page for one day (as a list of 0 or 1 entries), e.g. getEntriesForDay('abc', '2026-10-15')
export async function getEntriesForDay(childId, date) {
  return getEntriesBetween(childId, date, date)
}

// What happened on one day: the page and its scraps, or null when nothing was added.
// getDayDetails('abc', '2026-10-15') -> { entry: {...}, scraps: [{...}, {...}] }
export async function getDayDetails(childId, date) {
  const [entry] = await getEntriesForDay(childId, date)
  if (!entry) return null

  const scraps = await getScrapsForEntry(entry.id)
  return scraps.length > 0 ? { entry, scraps } : null
}
