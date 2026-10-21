const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const KIND_LABELS = { activity: 'Activity', interaction: 'Interaction', memory: 'Memory' }
const MOOD_LABELS = {
  happy: 'Happy and excited',
  silly: 'Silly and giggly',
  calm: 'Calm and cosy',
  sleepy: 'Sleepy and snuggly',
}

// "2026-10-04" -> "October 4"
function longDate(dayKey) {
  const [, month, day] = dayKey.split('-').map(Number)
  return `${MONTHS[month - 1]} ${day}`
}

function plural(count, one, many) {
  return `${count} ${count === 1 ? one : many}`
}

// The cards of the summary, in the order they are stuck on the pages:
// milestones first, then how the month felt, then random scraps, then the numbers.
function buildCards({ childName, summary, mediaUrls }) {
  const cards = []

  for (const { milestone, entry, scrap } of summary.highlights) {
    cards.push({
      id: `milestone-${milestone.id}`,
      type: 'milestone',
      label: `${childName} reached a milestone`,
      dateLabel: longDate(entry.date),
      title: milestone.title,
      text: scrap.text,
      color: milestone.color,
    })
  }
  if (summary.highlights.length === 0) {
    cards.push({
      id: 'no-milestones',
      type: 'hint',
      text: 'No milestones this month — maybe next month!',
    })
  }

  if (summary.mood) {
    cards.push({
      id: 'mood',
      type: 'mood',
      mood: summary.mood,
      label: `How ${childName} felt this month`,
      title: MOOD_LABELS[summary.mood],
    })
  }

  for (const { entry, scrap, media } of summary.picks) {
    const shown = media.find((item) => mediaUrls[item.id])
    if (shown) {
      cards.push({
        id: scrap.id,
        type: 'photo',
        mediaKind: shown.kind,
        url: mediaUrls[shown.id],
        name: shown.name,
        dateLabel: longDate(entry.date),
        text: scrap.text,
      })
    } else if (scrap.kind === 'memory') {
      cards.push({ id: scrap.id, type: 'note', dateLabel: longDate(entry.date), text: scrap.text })
    } else {
      cards.push({
        id: scrap.id,
        type: 'label',
        kind: scrap.kind,
        label: KIND_LABELS[scrap.kind],
        dateLabel: longDate(entry.date),
        title: scrap.text,
      })
    }
  }

  const { counts } = summary
  cards.push({
    id: 'stats',
    type: 'stats',
    label: 'The month in numbers',
    items: [
      plural(counts.days, 'day with memories', 'days with memories'),
      plural(counts.scraps, 'scrap', 'scraps'),
      plural(counts.milestones, 'milestone', 'milestones'),
      ...(counts.photos > 0 ? [plural(counts.photos, 'photo', 'photos')] : []),
      ...(counts.videos > 0 ? [plural(counts.videos, 'video', 'videos')] : []),
    ],
  })

  return cards
}

// The full-page monthly summary: one page of cards.
// `summary` comes from getMonthlySummary (null while it loads); mediaUrls maps a media id to
// an address for its photo or video.
export function presentSummary({ child = null, summary = null, mediaUrls = {} } = {}) {
  const childName = child?.name ?? 'Your child'
  const monthName = summary ? MONTHS[summary.month - 1] : ''
  const cards = summary ? buildCards({ childName, summary, mediaUrls }) : []

  return {
    isLoading: !summary,
    isEmpty: Boolean(summary) && summary.counts.scraps === 0,
    eyebrow: 'Monthly summary',
    title: summary ? `${monthName} ${summary.year}` : '',
    subtitle: child ? `${child.name}’s month` : 'This month',
    backLabel: 'Back to calendar',
    shuffleLabel: 'Shuffle picks',

    cards,

    blank: {
      title: summary ? `Nothing was added in ${monthName} yet` : '',
      hint: 'Add a photo, a word or a little story and it will show up here.',
    },
  }
}
