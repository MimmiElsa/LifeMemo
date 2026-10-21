import { useCallback, useEffect, useRef, useState } from 'react'
import { getEntryPage, getPageDates, loadMedia } from '../backend/index.js'

// The photos and videos on a list of scraps, ready to show: { [mediaId]: { id, kind, name, url } }.
// A file needs a temporary address (url) before a page can show it; `createdUrls` collects them
// so they can be released later.
async function readMedia(scraps, createdUrls) {
  const media = {}
  for (const scrap of scraps) {
    for (const mediaId of scrap.mediaIds) {
      const item = await loadMedia(mediaId)
      if (item?.file instanceof Blob) {
        const url = URL.createObjectURL(item.file)
        createdUrls.push(url)
        media[mediaId] = { id: mediaId, kind: item.kind, name: item.name, url }
      }
    }
  }
  return media
}

// The days that have a page in the scrapbook, oldest first (the child's entries and today).
// The open book shows two of them at a time.
export function usePageDates(childId, enabled, refreshKey) {
  const [loaded, setLoaded] = useState({ key: null, dates: [] })
  const key = `${childId}|${refreshKey}`

  useEffect(() => {
    if (!enabled || !childId) return undefined

    let cancelled = false
    getPageDates(childId).then((dates) => {
      if (!cancelled) setLoaded({ key, dates })
    })
    return () => {
      cancelled = true
    }
  }, [childId, enabled, key])

  return loaded.dates
}

// Loads one entry (the page of one day) with its scraps and their photos and videos.
// The open book uses it twice: once for the left page and once for the right page.
// `date` can be null (no page on that side). `enabled` is true while the scrapbook is showing, so
// the page is read again each time it opens. `refreshKey` changes when something was added,
// changed or removed, to read the pages again.
//
// Pages that were loaded are kept, so a page can be loaded ahead of time: `load(date)` is used
// before a page turn, so the page that is turned to is ready the moment the animation ends.
//
// Returns { page, media, loaded, load } for `date`:
//   page    { entry, scraps } or null when the day has no page yet
//   media   the photos and videos of the scraps, by media id
//   loaded  false until the page has been read
export function useEntryPage(childId, date, enabled, refreshKey) {
  const scope = `${childId}|${refreshKey}`
  const [cache, setCache] = useState({ scope, pages: {} })
  const pages = cache.scope === scope ? cache.pages : {}

  // the temporary addresses made for this scope are released when the pages are read again
  const createdUrls = useRef([])
  useEffect(() => {
    const urls = createdUrls.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.length = 0
    }
  }, [scope])

  // read one day from the backend (does not change any state)
  const fetchPage = useCallback(
    async (day) => {
      const page = await getEntryPage(childId, day)
      const media = await readMedia(page?.scraps ?? [], createdUrls.current)
      return { page, media }
    },
    [childId],
  )

  // read a day ahead of time and keep it; resolves with the page
  async function load(day) {
    const result = await fetchPage(day)
    setCache((current) => ({
      scope,
      pages: { ...(current.scope === scope ? current.pages : {}), [day]: result },
    }))
    return result
  }

  const isCached = Boolean(date && pages[date])
  useEffect(() => {
    if (!enabled || !childId || !date || isCached) return undefined

    let cancelled = false
    fetchPage(date).then((result) => {
      if (!cancelled) {
        setCache((current) => ({
          scope,
          pages: { ...(current.scope === scope ? current.pages : {}), [date]: result },
        }))
      }
    })
    return () => {
      cancelled = true
    }
  }, [childId, date, enabled, fetchPage, isCached, scope])

  const result = date ? pages[date] : undefined
  return {
    page: result?.page ?? null,
    media: result?.media ?? {},
    loaded: Boolean(result),
    load,
  }
}
