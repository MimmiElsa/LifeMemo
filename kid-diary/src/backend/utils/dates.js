// Date helpers.
//
// Days are stored as "day keys": text like "2026-10-15".
// Day keys sort correctly as plain text ("2026-10-03" < "2026-10-15"),
// which makes "everything between two days" easy to look up.

// Adds a leading zero: 7 -> "07"
function pad(number) {
  return String(number).padStart(2, '0')
}

// Turns a Date into a day key, e.g. new Date() -> "2026-10-15".
// Uses the device's local time. (date.toISOString() would use UTC time
// and could give yesterday's or tomorrow's date late in the evening.)
export function toDayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// First and last day of a month. Month is 1–12 (1 = January).
// getMonthRange(2026, 2) -> { start: "2026-02-01", end: "2026-02-28" }
export function getMonthRange(year, month) {
  // Day 0 of the NEXT month is the last day of this month.
  const lastDay = new Date(year, month, 0).getDate()
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(lastDay)}`,
  }
}

// TODO: calculate a child's age from their birthday ("2 years, 3 months")
// TODO: start/end of a week or year (for the summary)
