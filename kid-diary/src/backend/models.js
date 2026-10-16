// Describes what each kind of data looks like, and creates new objects


//The rule of thumb is that if a function only shapes or checks data, it goes here in models.


import { toDayKey } from './utils/dates.js'
import { createId } from './utils/ids.js'

// Entry – one memory in the scrapbook.
//   date:     day key like "2026-10-15" (defaults to today)
//   mediaIds: ids of photos/videos/audio/drawings attached to it
//   stickers: stickers placed on it (filled in by issue #7)
export function createEntry({ childId, date = toDayKey(), text = '', emojis = [] }) {
  if (!childId) throw new Error('An entry needs a childId')

  const now = new Date().toISOString()
  return {
    id: createId(),
    childId,
    date,
    text,
    emojis,
    mediaIds: [],
    stickers: [],
    createdAt: now,
    updatedAt: now,
  }
}


export function createChild ({ name, birthday }){

   const now = new Date().toISOString()
  return {
    id: createId(),  
    name,
    birthday,
    photoId: null,
    createdAt: now,
    updatedAt: now,
  }

};


// TODO: Media     – id, entryId, kind (photo / video / audio / drawing), file
// TODO: Milestone – id, childId, title, date, linked entry (optional)
