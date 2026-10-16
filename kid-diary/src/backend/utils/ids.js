// Creates unique IDs for new children, entries, media and milestones.
//
// Made from the current time + random letters, e.g. "mgr3k1x2-8f3k2l9q".
// (crypto.randomUUID() would be nicer, but the browser only allows it over
// HTTPS, and the iPad demo might run over plain HTTP.)
export function createId() {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `${time}-${random}`
}
