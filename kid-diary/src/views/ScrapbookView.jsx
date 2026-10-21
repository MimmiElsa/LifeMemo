export function ScrapbookView({ model, onDelete }) {
  return (
    <section className="memory-page">
      <h1>{model.title}</h1>
      {model.memories.length === 0 ? (
        <p>{model.emptyMessage}</p>
      ) : (
        <div className="scrapbook-list">
          {model.memories.map((memory) => (
            <article className="scrapbook-item" key={memory.id}>
              {memory.kind === 'photo' ? (
                <img src={memory.url} alt={memory.name} />
              ) : (
                <video controls src={memory.url} />
              )}
              <div>
                <p>{memory.name}</p>
                <button type="button" onClick={() => onDelete(memory)}>
                  {memory.deleteLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}