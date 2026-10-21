import { useEffect, useState } from 'react'
import { getDayDetails, getDaysWithEntries } from '../backend/index.js'
import { toDayKey } from '../backend/utils/dates.js'

// State and data loading for the calendar page.
// Opens on the current month with today selected. `enabled` is true while the
// calendar page is showing, so the data is read again each time the page is opened.
export function useCalendar(childId, enabled) {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(() => toDayKey())
  const [days, setDays] = useState([])
  const [details, setDetails] = useState(null)

  useEffect(() => {
    if (!enabled || !childId) return undefined

    let cancelled = false
    getDaysWithEntries(childId, year, month).then((result) => {
      if (!cancelled) setDays(result)
    })
    return () => {
      cancelled = true
    }
  }, [childId, enabled, year, month])

  useEffect(() => {
    if (!enabled || !childId || !selectedDate) return undefined

    let cancelled = false
    getDayDetails(childId, selectedDate).then((result) => {
      if (!cancelled) setDetails(result)
    })
    return () => {
      cancelled = true
    }
  }, [childId, enabled, selectedDate])

  function changeMonth(step) {
    const next = new Date(year, month - 1 + step, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
    setSelectedDate(null)
    setDetails(null)
  }

  return {
    year,
    month,
    selectedDate,
    days,
    details,
    selectDate: setSelectedDate,
    showPreviousMonth: () => changeMonth(-1),
    showNextMonth: () => changeMonth(1),
  }
}
