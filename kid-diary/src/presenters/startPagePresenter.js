export function presentStartPage({ child = null, recentEntries = [] } = {}) {
  return {
    childName: child?.name ?? 'Your little story',
    greeting: child ? `A little moment with ${child.name}` : 'A little moment to remember',
    recentEntries: recentEntries.map((entry) => ({ ...entry })),
    hasChild: Boolean(child),
  }
}