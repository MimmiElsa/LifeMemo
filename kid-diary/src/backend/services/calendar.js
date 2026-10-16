// Issue #2 – Calendar
//
// The calendar screen asks two questions:
//   1. "Which days in this month have memories?" -> to mark those days
//   2. "What happened on this day?"              -> when a day is tapped

import { getMonthRange } from '../utils/dates.js'
import { getEntriesBetween } from './entries.js'

// Days in a month that have at least one entry, with how many.
// Month is 1–12 (1 = January).
// getDaysWithEntries('abc', 2026, 10)
//   -> [{ date: '2026-10-03', count: 1 }, { date: '2026-10-15', count: 2 }]
export async function getDaysWithEntries(childId, year, month) {
  const { start, end } = getMonthRange(year, month)
  const entries = await getEntriesBetween(childId, start, end)

  const counts = {}
  for (const entry of entries) {
    counts[entry.date] = (counts[entry.date] ?? 0) + 1
  }

  // Entries are already sorted by date, so the days come out in order.
  return Object.entries(counts).map(([date, count]) => ({ date, count }))
}

// All entries for one day, e.g. getEntriesForDay('abc', '2026-10-15')
export async function getEntriesForDay(childId, date) {
  return getEntriesBetween(childId, date, date)
}
