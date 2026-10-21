import { useCallback, useEffect, useState } from 'react'
import { getDayDetails, getNeighbouringEntryDates } from '../backend/index.js'

const NO_NEIGHBOURS = { previous: null, next: null }

// Loads the entry (day page) of one child on one day, with its scraps, for the scrapbook.
// `enabled` is true while the scrapbook is showing, so the page is read again each time it opens.
// `refreshKey` changes when something was added or removed, to read the pages again.
//
// Pages that were loaded are kept, so a page can be loaded ahead of time: `load(date)` is used
// before a page turn, so the page that is turned to is ready the moment the animation ends.
//
// Returns { details, neighbours, loaded, load } for `date`, where neighbours = { previous, next }
// are the days to turn to and loaded is false until the page has been read.
export function useEntryDay(childId, date, enabled, refreshKey) {
  const scope = `${childId}|${refreshKey}`
  const [cache, setCache] = useState({ scope, pages: {} })
  const pages = cache.scope === scope ? cache.pages : {}

  // read one day from the backend (does not change any state)
  const fetchPage = useCallback(
    async (day) => {
      const [details, neighbours] = await Promise.all([
        getDayDetails(childId, day),
        getNeighbouringEntryDates(childId, day),
      ])
      return { details, neighbours }
    },
    [childId],
  )

  function keep(day, page) {
    setCache((current) => ({
      scope,
      pages: { ...(current.scope === scope ? current.pages : {}), [day]: page },
    }))
  }

  // read a day ahead of time and keep it; resolves with the page
  async function load(day) {
    const page = await fetchPage(day)
    keep(day, page)
    return page
  }

  const isCached = Boolean(pages[date])
  useEffect(() => {
    if (!enabled || !childId || !date || isCached) return undefined

    let cancelled = false
    fetchPage(date).then((page) => {
      if (!cancelled) {
        setCache((current) => ({
          scope,
          pages: { ...(current.scope === scope ? current.pages : {}), [date]: page },
        }))
      }
    })
    return () => {
      cancelled = true
    }
  }, [childId, date, enabled, fetchPage, isCached, scope])

  const page = pages[date]
  return {
    details: page?.details ?? null,
    neighbours: page?.neighbours ?? NO_NEIGHBOURS,
    loaded: Boolean(page),
    load,
  }
}
