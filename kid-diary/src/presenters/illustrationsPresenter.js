import { ILLUSTRATION_LIBRARY } from '../backend/demoIdeas.js'

// The picture library: groups of pictures to point at and talk about together.
export function presentIllustrations() {
  return {
    title: 'Picture library',
    subtitle: 'Point, tap and talk about the pictures together.',
    backLabel: 'Home',
    sayLabel: 'Say it',
    previousLabel: 'Previous picture',
    nextLabel: 'Next picture',
    closeLabel: 'Close',
    categories: ILLUSTRATION_LIBRARY.map((category) => ({
      id: category.id,
      label: category.label,
      cover: category.items.find((item) => item.image) ?? { emoji: category.cover },
      items: category.items.map((item) => ({ ...item })),
    })),
  }
}
