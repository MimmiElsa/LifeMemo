// Issue #4 – Scrapbook
//
// An "entry" is one memory: a date, text, emojis and attached media.

import { createEntry } from '../models.js'
import { get, getAll, put } from '../store.js'

// Create and save a new entry. Returns the saved entry (with its new id).
// addEntry({ childId: 'abc', date: '2026-10-15', text: 'First day at preschool!' })
export async function addEntry(fields) {
  const entry = createEntry(fields)
  await put('entries', entry)
  return entry
}

// All of a child's entries from startDay to endDay (both included),
// oldest first. Days are day keys like "2026-10-15".
export async function getEntriesBetween(childId, startDay, endDay) {
  const all = await getAll('entries')
  return all
    .filter((entry) => entry.childId === childId)
    .filter((entry) => entry.date >= startDay && entry.date <= endDay)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
}

export async function attachMediaToEntry(entryId, mediaId) {
  const entry = await get('entries', entryId)
  if (!entry) throw new Error(`Entry not found: ${entryId}`)

  entry.mediaIds = [...entry.mediaIds, mediaId]
  entry.updatedAt = new Date().toISOString()
  await put('entries', entry)
  return entry
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
