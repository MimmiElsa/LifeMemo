// "Little Book of Big Days" -> ["Little Book", "of Big Days"] so the label breaks nicely
function splitTitle(title) {
  const [first, ...rest] = title.split(' of ')
  return rest.length ? [first, `of ${rest.join(' of ')}`] : [title]
}

// The ideas behind the pocket cards. Each opens in a popup when its card is tapped.
function presentIdeas(childName) {
  const their = childName ? `${childName}’s` : 'a'
  return [
    {
      id: 'draw',
      label: 'Draw together',
      icon: 'pencil',
      color: '#ff9fcb',
      time: '10 min',
      text: `Trace around ${their} hand and let them colour it in. Add today’s date and one thing said while drawing.`,
    },
    {
      id: 'sound',
      label: 'Record a sound',
      icon: 'mic',
      color: '#c3b1ff',
      time: '2 min',
      text: 'Capture a giggle, a song or a brand-new word. In a year you’ll love hearing how it sounded today.',
    },
    {
      id: 'hunt',
      label: 'Colour hunt',
      icon: 'search',
      color: '#8fdda9',
      time: '15 min',
      text: 'Pick a colour and find three things that match on your next walk. Snap each one for a rainbow page.',
    },
  ]
}

export function presentScrapbook({ child = null } = {}) {
  const scrapbook = child?.scrapbook

  return {
    pageLabel: 'Scrapbook',
    pageTitle: child ? `${child.name}’s family book` : 'Your family book',
    decorateLabel: 'Decorate cover',
    summaryLabel: 'Summary',

    cover: {
      color: scrapbook?.coverColor ?? '#7FAEE6',
      nameLine: child ? `${child.name}’s` : 'Our',
      titleLines: splitTitle(scrapbook?.title ?? 'Little Book of Big Days'),
      volume: scrapbook?.volume ?? 'Volume 1',
      greeting: scrapbook?.greeting ?? 'Hej!',
      polaroids: scrapbook?.polaroids ?? [],
      openLabel: 'Open me!',
      openAriaLabel: 'Open the book',
    },

    spread: {
      title: 'This week’s spread',
      season: 'Autumn',
      description: child
        ? `Leaf treasure hunt — collect three leaves on a walk, photograph them together and let ${child.name} pick a favourite.`
        : 'Leaf treasure hunt — collect three leaves on a walk and photograph them together.',
      startLabel: 'Start this spread',
    },

    ideaPocket: {
      title: 'Idea pocket',
      hint: 'Tap a card',
      ideas: presentIdeas(child?.name),
      startLabel: 'Start this page',
      anotherLabel: 'Another idea',
      closeLabel: 'Close',
    },
  }
}
