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


// Scrapbook - the book belonging to ONE child's folder. Every child gets
// their own copy (created fresh here), so editing one book never touches another.
//   coverColor: cloth colour of the cover
//   title:      the book's name under the child's name on the label
//   volume:     small line at the bottom of the label
//   greeting:   the speech-bubble sticker on the cover
//   polaroids:  taped photos on the cover (scene = which drawing, caption = handwriting)
export function createScrapbook({
  coverColor = '#7FAEE6',
  title = 'Little Book of Big Days',
  volume = 'Volume 1',
  greeting = 'Hej!',
} = {}) {
  return {
    coverColor,
    title,
    volume,
    greeting,
    polaroids: [
      { id: 'polaroid-1', scene: 'puddle', caption: 'first puddle' },
      { id: 'polaroid-2', scene: 'fort', caption: 'blanket fort' },
    ],
  }
}


// TODO: Media    – id, entryId, kind (photo / video / audio / drawing), file
// TODO: Milestone – id, childId, title, date, linked entry (optional)
