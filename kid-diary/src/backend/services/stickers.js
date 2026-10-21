// Issue #7 – Stickers / Illustrations
//
// Backend part only: saving and loading. How stickers look is a design task.
// TODO: save a drawing as an image (stored via media.js)
// A sticker sits on an entry's spread (the two facing pages) at a position in percent.

import { createSticker } from '../models.js'
import { get, put } from '../store.js'
import { getOrCreateEntry } from './entries.js'

// Stick a sticker on a day's page (the page is created if it doesn't exist yet).
// Returns the sticker.
// addSticker({ childId: 'abc', date: '2026-10-15', sticker: 'star', x: 30, y: 60 })
export async function addSticker({ childId, date, ...fields }) {
  const entry = await getOrCreateEntry(childId, date)
  const sticker = createSticker(fields)
  entry.stickers = [...entry.stickers, sticker]
  entry.updatedAt = new Date().toISOString()
  await put('entries', entry)
  return sticker
}

// Move a sticker to a new place (x and y in percent of the spread).
export async function moveSticker(entryId, stickerId, { x, y }) {
  const entry = await get('entries', entryId)
  if (!entry) throw new Error(`Entry not found: ${entryId}`)

  entry.stickers = entry.stickers.map((item) => (item.id === stickerId ? { ...item, x, y } : item))
  entry.updatedAt = new Date().toISOString()
  await put('entries', entry)
}

// Take a sticker off the page.
export async function removeSticker(entryId, stickerId) {
  const entry = await get('entries', entryId)
  if (!entry) throw new Error(`Entry not found: ${entryId}`)

  entry.stickers = entry.stickers.filter((item) => item.id !== stickerId)
  entry.updatedAt = new Date().toISOString()
  await put('entries', entry)
}
