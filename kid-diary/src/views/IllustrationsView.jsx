import { useEffect, useState } from 'react'
import { NavIcon } from './NavIcon.jsx'
import { PictureArt } from './PictureArt.jsx'

// Reads the word out loud, when the device can
function sayWord(word) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(word))
}

// One picture, big, with its word. The arrows go to the picture before and after it.
function Viewer({ items, labels, onClose, onMove, index }) {
  const item = items[index]

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onMove(-1)
      if (event.key === 'ArrowRight') onMove(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onMove])

  return (
    <div className="illus-viewer-backdrop" onClick={onClose}>
      <div
        aria-label={item.label}
        aria-modal="true"
        className="illus-viewer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label={labels.closeLabel} className="illus-viewer-close" onClick={onClose} type="button">
          <NavIcon name="close" size={18} />
        </button>

        <button
          aria-label={labels.previousLabel}
          className="illus-viewer-arrow"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          type="button"
        >
          <NavIcon name="chevron-left" size={26} />
        </button>

        <div className="illus-viewer-picture" key={item.id}>
          <PictureArt option={item} size="huge" />
          <strong>{item.label}</strong>
          <button className="illus-say" onClick={() => sayWord(item.label)} type="button">
            <NavIcon name="mic" size={16} />
            {labels.sayLabel}
          </button>
        </div>

        <button
          aria-label={labels.nextLabel}
          className="illus-viewer-arrow"
          disabled={index === items.length - 1}
          onClick={() => onMove(1)}
          type="button"
        >
          <NavIcon name="chevron-right" size={26} />
        </button>
      </div>
    </div>
  )
}

// The picture library: pick a group, then browse its pictures. Tapping one shows it big.
export function IllustrationsView({ model, onBack }) {
  const [categoryId, setCategoryId] = useState(model.categories[0].id)
  const [openIndex, setOpenIndex] = useState(null)
  const category = model.categories.find((item) => item.id === categoryId)

  function moveViewer(step) {
    setOpenIndex((current) => Math.min(category.items.length - 1, Math.max(0, current + step)))
  }

  return (
    <section className="illus-page">
      <header className="illus-header">
        <button className="back-button illus-back" onClick={onBack} type="button">
          <NavIcon name="chevron-left" size={18} />
          {model.backLabel}
        </button>
        <div>
          <h1>{model.title}</h1>
          <p>{model.subtitle}</p>
        </div>
      </header>

      <div aria-label={model.title} className="illus-categories" role="tablist">
        {model.categories.map((item) => (
          <button
            aria-selected={item.id === categoryId}
            className={`illus-category${item.id === categoryId ? ' is-active' : ''}`}
            key={item.id}
            onClick={() => setCategoryId(item.id)}
            role="tab"
            type="button"
          >
            <PictureArt option={item.cover} size="tab" />
            {item.label}
          </button>
        ))}
      </div>

      <ul className="illus-grid" key={category.id}>
        {category.items.map((item, index) => (
          <li key={item.id}>
            <button className="illus-card" onClick={() => setOpenIndex(index)} type="button">
              <PictureArt option={item} size="card" />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {openIndex !== null && (
        <Viewer
          index={openIndex}
          items={category.items}
          labels={model}
          onClose={() => setOpenIndex(null)}
          onMove={moveViewer}
        />
      )}
    </section>
  )
}
