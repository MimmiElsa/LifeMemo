// Demo data for the exhibition: Lucas already has a tower and some scrapbook days.
// Replace with real saved data once children and milestones are stored too.
import { createEntry, createMilestone, createScrap, createScrapbook } from './models.js'
import { createSampleMilestones, LUCAS_BIRTHDAY } from './sampleMilestones.js'
import { put } from './store.js'

export const LUCAS_ID = 'child-lucas'

// Built once, so the milestones keep pointing at the scraps saved in the store.
const sample = createSampleMilestones(LUCAS_ID)

// A few recent days with a mood and some scraps, so the calendar has something to show.
const RECENT_DAYS = [
  ['2026-10-01', 'happy', [['memory', 'Splashed in every puddle on the way home']]],
  ['2026-10-02', 'playful', [['interaction', 'Made up a song about the cat']]],
  ['2026-10-03', 'happy', [['activity', 'Painted with fingers']]],
  ['2026-10-04', 'calm', [
    ['memory', 'Said a new word: cabbage'],
    ['activity', 'Leaf treasure hunt in the park'],
    ['memory', 'Brushed my own teeth, all by myself!', 'Brushed my own teeth'],
  ]],
  ['2026-10-09', 'playful', [['interaction', 'Splashed in the bath and sang to the rubber duck']]],
  ['2026-10-12', 'dreamy', [['memory', 'Fell asleep in the car']]],
  ['2026-10-17', 'happy', [
    ['activity', 'Baked apple muffins together'],
    ['memory', 'Said "tack" to the baker without being asked'],
  ]],
]

// An item can have a third part: the title of a milestone that marks that scrap.
function createRecentDays() {
  const entries = []
  const scraps = []
  const milestones = []
  for (const [date, mood, items] of RECENT_DAYS) {
    const entry = createEntry({ childId: LUCAS_ID, date, mood })
    entries.push(entry)
    for (const [kind, text, milestoneTitle] of items) {
      const scrap = createScrap({ entryId: entry.id, kind, text })
      scraps.push(scrap)
      if (milestoneTitle) {
        milestones.push(
          createMilestone({
            childId: LUCAS_ID,
            title: milestoneTitle,
            date,
            scrapId: scrap.id,
            source: 'user',
            color: '#8FDDA9',
          }),
        )
      }
    }
  }
  return { entries, scraps, milestones }
}

const recent = createRecentDays()

export const LUCAS_DEMO = {
  id: LUCAS_ID,
  name: 'Lucas',
  birthday: LUCAS_BIRTHDAY,
  milestones: [...sample.milestones, ...recent.milestones],
  scrapbook: createScrapbook(),
}

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
