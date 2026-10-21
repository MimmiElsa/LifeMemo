// Demo data for the exhibition: a ready-made tower for Lucas.
// Replace with real saved data once the store keeps entries, scraps and milestones.
import { createEntry, createMilestone, createScrap } from './models.js'
import { toDayKey } from './utils/dates.js'

export const LUCAS_BIRTHDAY = '2024-03-14'

// Each milestone that has already happened is a scrap on its own day's entry (page).
//   scrap:  the scrap the milestone marks, as [kind, text]
//   extras: other scraps on the same page, as [kind, text]
// Milestones still to come have no entry yet, so they have no scrap.
const SAMPLES = [
  {
    title: 'Hello, Lucas!', date: '2024-03-14', source: 'suggested', color: '#FFD84D', mood: 'happy',
    scrap: ['memory', 'Our little Lucas arrived at 06:42. Tiny hands, a lot of hair.'],
    extras: [['memory', 'First cuddle with Grandma and Grandpa']],
  },
  {
    title: 'First smile', date: '2024-05-02', source: 'user', color: '#8EC5FF', mood: 'happy',
    scrap: ['memory', 'A real smile at last, right in the middle of the morning song.'],
    extras: [['interaction', 'Sang "Blinka lilla stjärna" three times']],
  },
  {
    title: 'First Midsummer', date: '2024-06-21', source: 'suggested', color: '#8FDDA9', mood: 'playful',
    scrap: ['memory', 'Flower crown in the garden. Lucas tried to eat it.'],
    extras: [['activity', 'Picked seven flowers for the crown']],
  },
  {
    title: 'First tooth', date: '2024-09-28', source: 'user', color: '#FFB27A', mood: 'dreamy',
    scrap: ['memory', 'A tiny white tooth at the bottom. Not a happy night, but a big day.'],
    extras: [],
  },
  {
    title: 'First Christmas', date: '2024-12-24', source: 'suggested', color: '#FF9FCB', mood: 'calm',
    scrap: ['memory', 'Lucas loved the wrapping paper more than the presents.'],
    extras: [['activity', 'Hung the first ornament on the tree together']],
  },
  {
    title: '1st birthday', date: '2025-03-14', source: 'suggested', color: '#FFD84D', mood: 'happy',
    scrap: ['memory', 'One year old! Cake everywhere, including the ceiling.'],
    extras: [['interaction', 'Everyone sang, Lucas clapped along']],
  },
  {
    title: 'First steps', date: '2025-04-03', source: 'user', color: '#C3B1FF', mood: 'happy',
    scrap: ['memory', 'Three wobbly steps from the sofa to Mum. Then a big sit-down.'],
    extras: [['activity', 'Practised walking between two cushions']],
  },
  {
    title: 'First word: “mamma”', date: '2025-07-18', source: 'user', color: '#8EC5FF', mood: 'calm',
    scrap: ['interaction', 'Said "mamma" clearly while looking right at me.'],
    extras: [],
  },
  {
    title: 'Started preschool', date: '2025-08-18', source: 'user', color: '#8FDDA9', mood: 'calm',
    scrap: ['memory', 'First day at preschool. A few tears at the door, then a big wave goodbye.'],
    extras: [['memory', 'Picked up with a painted handprint']],
  },
  {
    title: 'First Lucia', date: '2025-12-13', source: 'suggested', color: '#FFB27A', mood: 'dreamy',
    scrap: ['memory', 'Watched the Lucia procession with a candle-shaped biscuit.'],
    extras: [],
  },
  {
    title: '2nd birthday', date: '2026-03-14', source: 'suggested', color: '#FF9FCB', mood: 'playful',
    scrap: ['memory', 'Two! A dinosaur cake and a very serious blowing-out of the candles.'],
    extras: [['activity', 'Dinosaur treasure hunt in the garden']],
  },
  {
    title: 'Rode the balance bike', date: '2026-09-06', source: 'user', color: '#C3B1FF', mood: 'happy',
    scrap: ['memory', 'Whole lap around the park without putting a foot down.'],
    extras: [['interaction', 'Shouted "Titta mig!" the entire way']],
  },
  { title: '1,000 days old', date: '2026-12-09', source: 'suggested', color: '#FFD84D' },
  { title: 'Turns 3!', date: '2027-03-14', source: 'suggested', color: '#FF9FCB' },
]

// Every milestone that has already happened gets its own entry (day page) with its scraps,
// and the milestone points at the scrap it marks, so "Go to entry" has a page to open.
// Returns { entries, scraps, milestones }.
export function createSampleMilestones(childId) {
  const today = toDayKey()
  const entries = []
  const scraps = []

  const milestones = SAMPLES.map(({ title, date, source, color, mood, scrap, extras }) => {
    if (date > today || !scrap) {
      return createMilestone({ childId, title, date, source, color })
    }

    const entry = createEntry({ childId, date, mood })
    entries.push(entry)

    const [kind, text] = scrap
    const marked = createScrap({ entryId: entry.id, kind, text })
    scraps.push(marked)
    for (const [extraKind, extraText] of extras) {
      scraps.push(createScrap({ entryId: entry.id, kind: extraKind, text: extraText }))
    }

    return createMilestone({ childId, title, date, scrapId: marked.id, source, color })
  })

  return { entries, scraps, milestones }
}
