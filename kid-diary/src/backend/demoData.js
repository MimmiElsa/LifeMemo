// Demo data for the exhibition: Lucas already has a tower and some scrapbook days.
// Replace with real saved data once children and milestones are stored too.
import { createEntry, createScrap, createScrapbook } from './models.js'
import { createSampleMilestones, LUCAS_BIRTHDAY } from './sampleMilestones.js'
import { put } from './store.js'

export const LUCAS_ID = 'child-lucas'

// Built once, so the milestones keep pointing at the scraps saved in the store.
const sample = createSampleMilestones(LUCAS_ID)

export const LUCAS_DEMO = {
  id: LUCAS_ID,
  name: 'Lucas',
  birthday: LUCAS_BIRTHDAY,
  milestones: sample.milestones,
  scrapbook: createScrapbook(),
}

// A few recent days with a mood and some scraps, so the calendar has something to show.
const RECENT_DAYS = [
  ['2026-10-01', 'happy', [['memory', 'Splashed in every puddle on the way home']]],
  ['2026-10-02', 'silly', [['interaction', 'Made up a song about the cat']]],
  ['2026-10-03', 'happy', [['activity', 'Painted with fingers']]],
  ['2026-10-04', 'calm', [
    ['memory', 'Said a new word: cabbage'],
    ['activity', 'Leaf treasure hunt in the park'],
  ]],
  ['2026-10-12', 'sleepy', [['memory', 'Fell asleep in the car']]],
]

function createRecentDays() {
  const entries = []
  const scraps = []
  for (const [date, mood, items] of RECENT_DAYS) {
    const entry = createEntry({ childId: LUCAS_ID, date, mood })
    entries.push(entry)
    for (const [kind, text] of items) {
      scraps.push(createScrap({ entryId: entry.id, kind, text }))
    }
  }
  return { entries, scraps }
}

const recent = createRecentDays()

let seeding = null

// Saves the demo entries and scraps in the store. Safe to call more than once.
export function seedDemoData() {
  if (!seeding) {
    const entries = [...sample.entries, ...recent.entries]
    const scraps = [...sample.scraps, ...recent.scraps]
    seeding = Promise.all([
      ...entries.map((entry) => put('entries', entry)),
      ...scraps.map((scrap) => put('scraps', scrap)),
    ])
  }
  return seeding
}
