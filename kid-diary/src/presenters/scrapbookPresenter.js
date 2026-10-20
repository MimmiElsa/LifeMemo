export function presentScrapbook({ memories = [] } = {}) {
  return {
    title: 'Scrapbook',
    emptyMessage: 'No photos or videos yet.',
    memories: memories.map((memory) => ({
      ...memory,
      deleteLabel: `Delete ${memory.kind}`,
    })),
  }
}