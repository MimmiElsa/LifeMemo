import { useEffect, useState } from 'react'
import { getMonthlySummary } from '../backend/index.js'

const NO_URLS = {}

// Photos and videos are saved as files, so the page needs a temporary address for each one
function createMediaUrls(summary) {
  const urls = {}
  for (const { media } of [...summary.highlights, ...summary.picks]) {
    for (const item of media) {
      if (item.file instanceof Blob) urls[item.id] = URL.createObjectURL(item.file)
    }
  }
  return urls
}

// Loads the summary of one month for the summary page.
// `enabled` is true while the page is showing. `shuffleKey` changes to pick other random scraps.
// Returns { summary, mediaUrls }: summary is null until it has been read, and mediaUrls maps
// a media id to an address the page can show (the addresses are released when the page changes).
export function useMonthlySummary(childId, year, month, enabled, milestones, shuffleKey) {
  const [loaded, setLoaded] = useState({ key: null, summary: null, mediaUrls: NO_URLS })
  const key = `${childId}|${year}|${month}|${shuffleKey}`

  useEffect(() => {
    if (!enabled || !childId) return undefined

    let cancelled = false
    let mediaUrls = NO_URLS
    getMonthlySummary(childId, year, month, { milestones }).then((summary) => {
      if (cancelled) return
      mediaUrls = createMediaUrls(summary)
      setLoaded({ key, summary, mediaUrls })
    })
    return () => {
      cancelled = true
      Object.values(mediaUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [childId, enabled, key, milestones, month, year])

  // a summary that belongs to another month or shuffle is not shown
  return loaded.key === key
    ? { summary: loaded.summary, mediaUrls: loaded.mediaUrls }
    : { summary: null, mediaUrls: NO_URLS }
}
