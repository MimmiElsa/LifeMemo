export function presentMemories({ memories = [] } = {}) {
  return {
    title: 'Scrapbook',
    backLabel: 'Back to cover',
    emptyMessage: 'No photos or videos yet.',
    memories: memories.map((memory) => ({
      ...memory,
      deleteLabel: `Delete ${memory.kind}`,
    })),
  }
}