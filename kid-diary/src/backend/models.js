// Describes what each kind of data looks like, and creates new objects


//The rule of thumb is that if a function only shapes or checks data, it goes here in models.


import { toDayKey } from './utils/dates.js'
import { createId } from './utils/ids.js'

// Words used across the app (agreed with the team):
//
//   Entry     - the page of ONE day in a child's scrapbook (one per child per day).
//               The calendar marks days that have an entry. Stickers sit on the entry.
//   Scrap     - one item on that page: an activity, an interaction or a memory.
//               Every scrap has its own id and belongs to exactly one entry.
//   Milestone - a mark on a scrap ("First steps") that shows up as a block in the
//               child's tower. "Go to entry" opens the day page with that scrap.

// The kinds of scrap a page can hold.
export const SCRAP_KINDS = ['activity', 'interaction', 'memory']

// How the child felt that day. The calendar tints the day with it (null = not set).
export const MOODS = ['happy', 'silly', 'calm', 'sleepy']

// Entry - the scrapbook page for one day.
//   date:     day key like "2026-10-15" (defaults to today)
//   mood:     one of MOODS, or null
//   stickers: stickers placed on the page (filled in by issue #7)
export function createEntry({ childId, date = toDayKey(), mood = null }) {
  if (!childId) throw new Error('An entry needs a childId')
  if (mood !== null && !MOODS.includes(mood)) throw new Error(`Unknown mood: ${mood}`)

  const now = new Date().toISOString()
  return {
    id: createId(),
    childId,
    date,
    mood,
    stickers: [],
    createdAt: now,
    updatedAt: now,
  }
}

// Scrap - one item on an entry's page.
//   entryId:  the page it sits on
//   kind:     one of SCRAP_KINDS
//   mediaIds: ids of photos/videos/audio/drawings attached to it
//   position: where it comes in the entry (0 = first). null until the entry's scraps
//             have been given an order; scraps without one come first, oldest first.
export function createScrap({ entryId, kind = 'memory', text = '', emojis = [], position = null }) {
  if (!entryId) throw new Error('A scrap needs an entryId')
  if (!SCRAP_KINDS.includes(kind)) throw new Error(`Unknown scrap kind: ${kind}`)

  const now = new Date().toISOString()
  return {
    id: createId(),
    entryId,
    kind,
    text,
    emojis,
    mediaIds: [],
    position,
    createdAt: now,
    updatedAt: now,
  }
}

// Sticker - a sticker stuck on an entry's spread (the two facing pages).
//   sticker:  which sticker (an id from the sticker catalog in the app)
//   x, y:     where its centre is, in percent of the spread (0-100)
//   rotation: degrees
export function createSticker({ sticker, x = 50, y = 50, rotation = 0 }) {
  if (!sticker) throw new Error('A sticker needs a sticker id')

  return { id: createId(), sticker, x, y, rotation }
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


// TODO: Media     – id, scrapId, kind (photo / video / audio / drawing), file
// Milestone - one block in a child's tower ("First steps").
//   scrapId: the scrap this milestone marks (its entry is the page "Go to entry" opens).
//            null only for a suggestion that has no memory linked yet.
//   date:    day key like "2025-04-03". For a linked milestone this is the date of the
//            scrap's entry (copy it when linking); for an unlinked suggestion it is the
//            day the milestone is expected.
//   source:  'suggested' (an idea from LifeMemo) or 'user' (added by the family)
//   color:   block colour in the tower
// A milestone the family adds themselves always has a scrap.
export function createMilestone({ childId, title, date, scrapId = null, source = 'user', color = '#8EC5FF' }) {
  if (!childId) throw new Error('A milestone needs a childId')
  if (!title) throw new Error('A milestone needs a title')
  if (source === 'user' && !scrapId) throw new Error('A milestone added by the family needs a scrapId')

  return {
    id: createId(),
    childId,
    title,
    date,
    scrapId,
    source,
    color,
    createdAt: new Date().toISOString(),
  }
}
