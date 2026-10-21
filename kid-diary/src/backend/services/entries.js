// Issue #4 – Scrapbook
//
// An "entry" is the scrapbook page of one day. Each thing a user adds to that
// page is a "scrap" (activity, interaction or memory) with its own id.

import { createEntry, createScrap } from '../models.js'
import { get, getAll, put } from '../store.js'

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
  const scrap = createScrap({ entryId: entry.id, ...fields })
  await put('scraps', scrap)
  return scrap
}

// All scraps on one entry's page, oldest first.
export async function getScrapsForEntry(entryId) {
  const all = await getAll('scraps')
  return all
    .filter((scrap) => scrap.entryId === entryId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
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

// TODO: get, edit and delete a single entry or scrap
// TODO: deleting a scrap must also clear the milestone that points at it
