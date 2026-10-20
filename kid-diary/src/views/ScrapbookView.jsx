import { useEffect, useState } from 'react'
import { NavIcon } from './NavIcon.jsx'

function PolaroidArt({ scene }) {
  if (scene === 'fort') {
    return (
      <div aria-hidden="true" className="polaroid-art polaroid-art--fort">
        <div className="fort-roof" />
        <div className="fort-door" />
      </div>
    )
  }
  return (
    <div aria-hidden="true" className="polaroid-art polaroid-art--puddle">
      <div className="puddle-sun" />
      <div className="puddle-hill puddle-hill--back" />
      <div className="puddle-hill puddle-hill--front" />
    </div>
  )
}

function Polaroid({ polaroid, position }) {
  return (
    <div className={`polaroid polaroid--${position}`}>
      <PolaroidArt scene={polaroid.scene} />
      <div className="polaroid-caption">{polaroid.caption}</div>
      <div aria-hidden="true" className="polaroid-tape" />
    </div>
  )
}

function IdeaModal({ idea, labels, onAnother, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="idea-modal-backdrop" onClick={onClose}>
      <div
        aria-labelledby="idea-modal-title"
        aria-modal="true"
        className="idea-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        style={{ '--idea-color': idea.color }}
      >
        <button aria-label={labels.close} className="idea-modal-close" onClick={onClose} type="button">
          <NavIcon name="close" size={18} />
        </button>

        <div className="idea-modal-icon">
          <NavIcon name={idea.icon} size={32} />
        </div>

        <h2 id="idea-modal-title">{idea.label}</h2>
        <span className="idea-time">
          <NavIcon name="clock" size={14} />
          {idea.time}
        </span>
        <p>{idea.text}</p>

        <div className="idea-actions">
          <button className="dark-pill-button dark-pill-button--large" type="button">
            <NavIcon name="plus" size={15} />
            {labels.start}
          </button>
          <button className="outline-pill-button" onClick={onAnother} type="button">
            <NavIcon name="shuffle" size={17} />
            {labels.another}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ScrapbookView({ model }) {
  const { cover, spread, ideaPocket } = model
  const [topPolaroid, lowerPolaroid] = cover.polaroids
  // The pocket starts closed: no idea is chosen until a card is tapped
  const [openIdeaId, setOpenIdeaId] = useState(null)
  const openIdea = ideaPocket.ideas.find((idea) => idea.id === openIdeaId)

  function showAnotherIdea() {
    const ideas = ideaPocket.ideas
    const index = ideas.findIndex((idea) => idea.id === openIdeaId)
    setOpenIdeaId(ideas[(index + 1) % ideas.length].id)
  }

  return (
    <section className="scrapbook-page">
      <header className="scrapbook-header">
        <div>
          <div className="scrapbook-eyebrow">{model.pageLabel}</div>
          <h1 className="scrapbook-title">{model.pageTitle}</h1>
        </div>
        <div className="scrapbook-header-actions">
          <button className="outline-pill-button" type="button">
            <NavIcon name="pencil" size={18} />
            {model.decorateLabel}
          </button>
          <button className="outline-pill-button" type="button">
            <NavIcon name="summary" size={18} />
            {model.summaryLabel}
          </button>
        </div>
      </header>

      <div className="scrapbook-body">
        {/* ===== The book ===== */}
        <div className="book" style={{ '--cover': cover.color }}>
          <div className="book-pages-edge" />
          <div className="book-pages" />

          <div className="book-cover-shadow">
            <div className="book-cover cloth" />
          </div>
          <div className="book-spine" />
          <div className="stitch stitch--left" />
          <div className="stitch stitch--top" />
          <div className="stitch stitch--bottom" />
          <div className="stitch stitch--right" />

          <div aria-hidden="true" className="book-ribbon" />

          {topPolaroid && <Polaroid polaroid={topPolaroid} position="top" />}

          <svg aria-hidden="true" className="book-star" viewBox="0 0 24 24" width="58" height="58">
            <path
              d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"
              fill="#FF8FC7"
              stroke="#FFFFFF"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>

          <div className="book-label">
            <div className="book-label-name">{cover.nameLine}</div>
            <div className="book-label-title">
              {cover.titleLines.map((line, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </div>
            <div className="book-label-rule" />
            <div className="book-label-volume">{cover.volume}</div>
          </div>

          {lowerPolaroid && <Polaroid polaroid={lowerPolaroid} position="lower" />}

          <div aria-hidden="true" className="book-friend">
            <div className="friend-eye friend-eye--left"><span /></div>
            <div className="friend-eye friend-eye--right"><span /></div>
            <div className="friend-mouth" />
            <div className="friend-cheek friend-cheek--left" />
            <div className="friend-cheek friend-cheek--right" />
          </div>
          <div className="book-greeting">{cover.greeting}</div>

          {/* "Open me!" note + turned page corner (animated) */}
          <div aria-hidden="true" className="open-note">
            <span className="open-note-text">{cover.openLabel}</span>
            <svg className="open-note-arrow" viewBox="0 0 46 40" width="46" height="40">
              <path d="M4 8c14-4 26 2 32 20" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3.5" />
              <path d="M28 26l8 4 3-9" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
            </svg>
          </div>
          <button aria-label={cover.openAriaLabel} className="open-corner" type="button">
            <span aria-hidden="true" className="open-corner-glow" />
            <span aria-hidden="true" className="open-corner-peel">
              <span className="open-corner-paper" />
            </span>
          </button>
        </div>

        {/* ===== Right column ===== */}
        <div className="scrapbook-side">
          <div className="spread-note">
            <div aria-hidden="true" className="spread-note-tape" />
            <div className="spread-note-head">
              <div className="spread-note-title">{spread.title}</div>
              <span className="spread-note-tag">{spread.season}</span>
            </div>
            <p className="spread-note-text">{spread.description}</p>
            <button className="dark-pill-button" type="button">
              <NavIcon name="plus" size={15} />
              {spread.startLabel}
            </button>
          </div>

          <div className="pocket-heading">
            <div className="pocket-title">{ideaPocket.title}</div>
            <div className="pocket-hint">{ideaPocket.hint}</div>
          </div>

          <div className="pocket" style={{ '--cover': cover.color }}>
            {ideaPocket.ideas.map((idea) => (
              <button
                className={`idea-card idea-card--${idea.id}`}
                key={idea.id}
                onClick={() => setOpenIdeaId(idea.id)}
                type="button"
              >
                <NavIcon name={idea.icon} size={24} />
                <span>{idea.label}</span>
              </button>
            ))}
            <div aria-hidden="true" className="pocket-front cloth">
              <div className="pocket-stitch" />
            </div>
          </div>
        </div>
      </div>

      {openIdea && (
        <IdeaModal
          idea={openIdea}
          labels={{
            start: ideaPocket.startLabel,
            another: ideaPocket.anotherLabel,
            close: ideaPocket.closeLabel,
          }}
          onAnother={showAnotherIdea}
          onClose={() => setOpenIdeaId(null)}
        />
      )}
    </section>
  )
}
