// The ONLY file that talks to the database.
//
// TEMPORARY VERSION: keeps everything in memory, so all data disappears
// when the page reloads. It exists so the rest of the backend can be built
// and tried out now. Later this file gets rewritten to use IndexedDB
// (data saved on the iPad), and later still maybe a cloud service.
// The four functions below keep the same names and behaviour, so nothing
// else in backend/ has to change when that happens.
//
// Every function is "async" (returns a Promise) because a real database
// takes a moment to answer. Callers use: const entry = await get(...)

const tables = {
  children: new Map(),
  entries: new Map(),
  media: new Map(),
  milestones: new Map(),
  settings: new Map(),
}

function getTable(name) {
  const table = tables[name]
  if (!table) throw new Error(`Unknown table: ${name}`)
  return table
}

// structuredClone makes a copy, like a real database does: changing an
// object after saving it does not secretly change the saved version.

// Get one item by its id (or undefined if it doesn't exist).
export async function get(tableName, id) {
  const item = getTable(tableName).get(id)
  return item === undefined ? undefined : structuredClone(item)
}

// Get every item in a table.
export async function getAll(tableName) {
  return [...getTable(tableName).values()].map((item) => structuredClone(item))
}

// Save an item (adds it, or replaces the item with the same id).
export async function put(tableName, item) {
  getTable(tableName).set(item.id, structuredClone(item))
  return item
}

// Delete an item by its id.
export async function remove(tableName, id) {
  getTable(tableName).delete(id)
}
