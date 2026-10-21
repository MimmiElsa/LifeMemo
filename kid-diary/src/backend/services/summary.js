// Issue #3 – Summary
//
// A summary looks back at a period of a child's scrapbook. The monthly summary gathers the
// entries (day pages) of one month and picks what to show:
//   1. the milestones of the month, first
//   2. a few other scraps from across the month, picked at random (one per day where possible,
//      so the picks are spread through the month)
//
// TODO: the same for a week and a year
// TODO: recordings in the counts and on the page (there is no recorded-audio media yet)

import { get } from '../store.js'
import { getMonthRange } from '../utils/dates.js'
import { getEntriesBetween, getScrapsForEntry } from './entries.js'

// A shuffled copy of a list (Fisher-Yates). `random` is only passed in by tests.
function shuffle(items, random) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// How many photos and videos are attached to a list of scraps
async function countMedia(scraps) {
  const counts = { photos: 0, videos: 0 }
  for (const scrap of scraps) {
    for (const mediaId of scrap.mediaIds) {
      const media = await get('media', mediaId)
      if (media?.kind === 'photo') counts.photos += 1
      if (media?.kind === 'video') counts.videos += 1
    }
  }
  return counts
}

// The photos and videos attached to a scrap (as saved in the store, with their file)
async function loadMedia(scrap) {
  const media = []
  for (const mediaId of scrap.mediaIds) {
    const item = await get('media', mediaId)
    if (item) media.push(item)
  }
  return media
}

// The mood the month had most often, from the days' moods (null if no day has a mood)
function dominantMood(days) {
  const counts = {}
  for (const { entry } of days) {
    if (entry.mood) counts[entry.mood] = (counts[entry.mood] ?? 0) + 1
  }
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return ranked.length > 0 ? ranked[0][0] : null
}

// The summary of one month.
//   milestones: the child's milestones (they are not in the store yet, so the caller passes them)
//   maxPicks:   how many random scraps to show besides the milestones
//   random:     a random number function (0 to 1), only changed in tests
//
// getMonthlySummary('abc', 2026, 10, { milestones })
//   -> {
//        year, month,
//        counts: { days, scraps, milestones, photos, videos },
//        mood: 'happy',                                // the mood of most days, or null
//        highlights: [{ milestone, entry, scrap, media }],   // the milestones, oldest first
//        picks: [{ entry, scrap, media }],                    // random scraps, oldest first
//      }
export async function getMonthlySummary(
  childId,
  year,
  month,
  { milestones = [], maxPicks = 5, random = Math.random } = {},
) {
  const { start, end } = getMonthRange(year, month)
  const entries = await getEntriesBetween(childId, start, end)

  // The days that have something on them, with their scraps
  const days = []
  for (const entry of entries) {
    const scraps = await getScrapsForEntry(entry.id)
    if (scraps.length > 0) days.push({ entry, scraps })
  }

  // 1. Milestones of the month, with the scrap each one marks
  const scrapById = new Map(days.flatMap((day) => day.scraps.map((scrap) => [scrap.id, scrap])))
  const entryByScrapId = new Map(
    days.flatMap((day) => day.scraps.map((scrap) => [scrap.id, day.entry])),
  )
  const highlights = milestones
    .filter((milestone) => milestone.scrapId && scrapById.has(milestone.scrapId))
    .map((milestone) => ({
      milestone,
      entry: entryByScrapId.get(milestone.scrapId),
      scrap: scrapById.get(milestone.scrapId),
    }))
    .sort((a, b) => a.entry.date.localeCompare(b.entry.date))

  // 2. Random scraps from the rest (written ones, photos and videos)
  const milestoneScrapIds = new Set(highlights.map((highlight) => highlight.scrap.id))
  const candidatesByDay = days
    .map(({ entry, scraps }) => ({
      entry,
      scraps: scraps.filter((scrap) => !milestoneScrapIds.has(scrap.id)),
    }))
    .filter((day) => day.scraps.length > 0)

  // First one scrap from each day (random days), then fill up from what is left
  const firstRound = shuffle(candidatesByDay, random).map((day) => ({
    entry: day.entry,
    scrap: shuffle(day.scraps, random)[0],
  }))
  const chosenIds = new Set(firstRound.map((pick) => pick.scrap.id))
  const leftovers = shuffle(
    candidatesByDay.flatMap((day) =>
      day.scraps.filter((scrap) => !chosenIds.has(scrap.id)).map((scrap) => ({ entry: day.entry, scrap })),
    ),
    random,
  )
  const picks = [...firstRound, ...leftovers]
    .slice(0, maxPicks)
    .sort((a, b) => a.entry.date.localeCompare(b.entry.date))

  for (const item of [...highlights, ...picks]) {
    item.media = await loadMedia(item.scrap)
  }

  const allScraps = days.flatMap((day) => day.scraps)
  const media = await countMedia(allScraps)

  return {
    year,
    month,
    counts: {
      days: days.length,
      scraps: allScraps.length,
      milestones: highlights.length,
      photos: media.photos,
      videos: media.videos,
    },
    mood: dominantMood(days),
    highlights,
    picks,
  }
}
