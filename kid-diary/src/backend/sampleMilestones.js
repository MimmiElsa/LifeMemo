// Demo data for the exhibition: a ready-made tower for Lucas.
// Replace with real saved data once the store keeps entries, scraps and milestones.
import { createEntry, createMilestone, createScrap } from './models.js'
import { toDayKey } from './utils/dates.js'

export const LUCAS_BIRTHDAY = '2024-03-14'

const SAMPLES = [
  ['Hello, Lucas!', '2024-03-14', 'suggested', '#FFD84D'],
  ['First smile', '2024-05-02', 'user', '#8EC5FF'],
  ['First Midsummer', '2024-06-21', 'suggested', '#8FDDA9'],
  ['First tooth', '2024-09-28', 'user', '#FFB27A'],
  ['First Christmas', '2024-12-24', 'suggested', '#FF9FCB'],
  ['1st birthday', '2025-03-14', 'suggested', '#FFD84D'],
  ['First steps', '2025-04-03', 'user', '#C3B1FF'],
  ['First word: “mamma”', '2025-07-18', 'user', '#8EC5FF'],
  ['Started preschool', '2025-08-18', 'user', '#8FDDA9'],
  ['First Lucia', '2025-12-13', 'suggested', '#FFB27A'],
  ['2nd birthday', '2026-03-14', 'suggested', '#FF9FCB'],
  ['Rode the balance bike', '2026-09-06', 'user', '#C3B1FF'],
  ['1,000 days old', '2026-12-09', 'suggested', '#FFD84D'],
  ['Turns 3!', '2027-03-14', 'suggested', '#FF9FCB'],
]

// Every milestone that has already happened gets its own entry (day page) and scrap,
// so "Go to entry" will have something to open. Suggestions still to come have no scrap yet.
// Returns { entries, scraps, milestones }; only the milestones are shown for now.
export function createSampleMilestones(childId) {
  const today = toDayKey()
  const entries = []
  const scraps = []

  const milestones = SAMPLES.map(([title, date, source, color]) => {
    if (date > today) {
      return createMilestone({ childId, title, date, source, color })
    }

    const entry = createEntry({ childId, date })
    const scrap = createScrap({ entryId: entry.id, kind: 'memory', text: title })
    entries.push(entry)
    scraps.push(scrap)
    return createMilestone({ childId, title, date, scrapId: scrap.id, source, color })
  })

  return { entries, scraps, milestones }
}
