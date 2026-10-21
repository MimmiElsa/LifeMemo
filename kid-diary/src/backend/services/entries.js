// Issue #4 – Scrapbook
//
// An "entry" is the scrapbook page of one day. Each thing a user adds to that
// page is a "scrap" (activity, interaction or memory) with its own id.

import { createEntry, createScrap, SCRAP_KINDS } from '../models.js'
import { get, getAll, put, remove } from '../store.js'
import { toDayKey } from '../utils/dates.js'

// The page for this child on this day, created the first time it is needed.
// getOrCreateEntry('abc', '2026-10-15')
export async function getOrCreateEntry(childId, date) {
  const all = await getAll('entries')
  const existing = all.find((entry) => entry.childId === childId && entry.date === date)
  if (existing) return existing

  const entry = createEntry({ childId, date })
  await put('entries', entry)
  return entry
}

// Add a scrap to a day's page (the page is created if it doesn't exist yet).
// Returns the saved scrap (with its new id).
// addScrap({ childId: 'abc', date: '2026-10-15', kind: 'memory', text: 'First day at preschool!' })
export async function addScrap({ childId, date, ...fields }) {
  const entry = await getOrCreateEntry(childId, date)
  const existing = await getScrapsForEntry(entry.id)
  const last = existing[existing.length - 1]
  // the new scrap goes last on the page
  const position = last ? (last.position ?? existing.length - 1) + 1 : 0

  const scrap = createScrap({ entryId: entry.id, position, ...fields })
  await put('scraps', scrap)
  return scrap
}

// The days that have a page in the scrapbook, oldest first: the child's entries plus today
// (today's page is always there to add to). The open book shows two of them side by side.
// getPageDates('abc') -> ['2026-10-01', '2026-10-04', '2026-10-21']
export async function getPageDates(childId, today = toDayKey()) {
  const all = await getAll('entries')
  const days = new Set(all.filter((entry) => entry.childId === childId).map((entry) => entry.date))
  days.add(today)
  return [...days].sort()
}

// All scraps on one entry's page, in the order they come on the page. Scraps that were
// never given a position come first, oldest first; then the ones with a position.
export async function getScrapsForEntry(entryId) {
  const all = await getAll('scraps')
  return all
    .filter((scrap) => scrap.entryId === entryId)
    .sort((a, b) => (a.position ?? -1) - (b.position ?? -1) || a.createdAt.localeCompare(b.createdAt))
}

// All of a child's entries (day pages) from startDay to endDay (both included),
// oldest first. Days are day keys like "2026-10-15".
export async function getEntriesBetween(childId, startDay, endDay) {
  const all = await getAll('entries')
  return all
    .filter((entry) => entry.childId === childId)
    .filter((entry) => entry.date >= startDay && entry.date <= endDay)
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Attach an uploaded photo/video (media) to a scrap.
export async function attachMediaToScrap(scrapId, mediaId) {
  const scrap = await get('scraps', scrapId)
  if (!scrap) throw new Error(`Scrap not found: ${scrapId}`)

  scrap.mediaIds = [...scrap.mediaIds, mediaId]
  scrap.updatedAt = new Date().toISOString()
  await put('scraps', scrap)
  return scrap
}

export async function getEntriesForChild(childId) {
  return (await getAll('entries'))
    .filter((entry) => entry.childId === childId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// list a child's entries, newest first
export async function sortEntriesByDate(entries) {
  return entries.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
}

// The page of one day with its scraps, for the scrapbook. Unlike getDayDetails (calendar.js)
// this also returns a page that has no scraps (it can still have stickers).
// getEntryPage('abc', '2026-10-15') -> { entry: {...}, scraps: [...] } or null if no page exists yet
export async function getEntryPage(childId, date) {
  const all = await getAll('entries')
  const entry = all.find((item) => item.childId === childId && item.date === date)
  if (!entry) return null

  return { entry, scraps: await getScrapsForEntry(entry.id) }
}

// Change the text and/or kind of a scrap. Returns the saved scrap.
// updateScrap('scrap-id', { text: 'New text', kind: 'activity' })
export async function updateScrap(scrapId, { text, kind } = {}) {
  const scrap = await get('scraps', scrapId)
  if (!scrap) throw new Error(`Scrap not found: ${scrapId}`)
  if (kind !== undefined && !SCRAP_KINDS.includes(kind)) throw new Error(`Unknown scrap kind: ${kind}`)

  if (text !== undefined) scrap.text = text
  if (kind !== undefined) scrap.kind = kind
  scrap.updatedAt = new Date().toISOString()
  await put('scraps', scrap)
  return scrap
}

// Delete a scrap and the photos/videos attached to it.
// (A milestone that marks this scrap has to be removed by whoever holds the milestones.)
export async function deleteScrap(scrapId) {
  const scrap = await get('scraps', scrapId)
  if (!scrap) return

  for (const mediaId of scrap.mediaIds) {
    await remove('media', mediaId)
  }
  await remove('scraps', scrapId)
}

// Move a scrap one place up (-1) or down (1) on its page. Does nothing at the ends.
// Returns true if the scrap moved.
export async function moveScrap(scrapId, direction) {
  const scrap = await get('scraps', scrapId)
  if (!scrap) return false

  const scraps = await getScrapsForEntry(scrap.entryId)
  const from = scraps.findIndex((item) => item.id === scrapId)
  const to = from + direction
  if (to < 0 || to >= scraps.length) return false

  // swap the two, then give every scrap its place so the order is kept
  ;[scraps[from], scraps[to]] = [scraps[to], scraps[from]]
  for (const [index, item] of scraps.entries()) {
    await put('scraps', { ...item, position: index, updatedAt: new Date().toISOString() })
  }
  return true
}

// TODO: get, edit and delete a whole entry
// TODO: deleting a scrap must also clear the milestone that points at it (done by the app for now)
