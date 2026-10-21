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

// Entry - the scrapbook page for one day.
//   date:     day key like "2026-10-15" (defaults to today)
//   stickers: stickers placed on the page (filled in by issue #7)
export function createEntry({ childId, date = toDayKey() }) {
  if (!childId) throw new Error('An entry needs a childId')

  const now = new Date().toISOString()
  return {
    id: createId(),
    childId,
    date,
    stickers: [],
    createdAt: now,
    updatedAt: now,
  }
}

// Scrap - one item on an entry's page.
//   entryId:  the page it sits on
//   kind:     one of SCRAP_KINDS
//   mediaIds: ids of photos/videos/audio/drawings attached to it
export function createScrap({ entryId, kind = 'memory', text = '', emojis = [] }) {
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


