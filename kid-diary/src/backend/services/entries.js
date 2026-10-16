// Issue #4 – Scrapbook
//
// An "entry" is one memory: a date, text, emojis and attached media.

import { createEntry } from '../models.js'
import { getAll, put } from '../store.js'

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

// TODO: get, edit and delete a single entry
// TODO: list a child's entries, newest first
