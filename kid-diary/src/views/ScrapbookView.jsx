import { useEffect, useRef, useState } from 'react'
import { EntryView } from './EntryView.jsx'
import { MilestoneModal, ScrapFormModal, StickerModal } from './EntryModals.jsx'
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

// The tools for editing an entry, in a bar that floats just under the book. They sit outside
// the pages, so opening the bar never moves anything on them. The bar belongs to the one entry
// that is being edited (the other page of the book is not touched).
const TOOLS = [
  { id: 'text', icon: 'text', variant: 'text' },
  { id: 'stickers', icon: 'smile' },
  { id: 'photo', icon: 'camera', variant: 'photo' },
  { id: 'audio', icon: 'mic', disabled: true },
]

function EditBar({ actions, date, labels }) {
  function pickTool(tool) {
    if (tool.id === 'stickers') actions.addSticker(date)
    else actions.addScrap(date, tool.variant)
  }

  return (
    <div className="edit-bar">
      <div className="edit-bar-tools">
        {TOOLS.map((tool) => (
          <button
            className="edit-tool"
            disabled={tool.disabled}
            key={tool.id}
            onClick={() => pickTool(tool)}
            title={tool.disabled ? labels.tools.audioSoon : undefined}
            type="button"
          >
            <span className={`edit-tool-tile edit-tool-tile--${tool.id}`}>
              <NavIcon name={tool.icon} size={20} />
            </span>
            <span className="edit-tool-name">{labels.tools[tool.id]}</span>
          </button>
        ))}
        <span aria-hidden="true" className="edit-bar-divider" />
        <button className="edit-bar-done" onClick={() => actions.toggleEdit(date)} type="button">
          <NavIcon name="check" size={16} />
          {labels.done}
        </button>
      </div>
    </div>
  )
}

// A first guess for the name of a milestone: the first words of the scrap
function milestoneTitleFor(scrap) {
  const words = (scrap.text || scrap.label).trim()
  const firstSentence = words.split(/[.!?\n]/)[0].trim()
  return firstSentence.length > 40 ? `${firstSentence.slice(0, 37)}...` : firstSentence
}

// The leaf that turns when browsing entries. Turning forward, the right page flips over to the left;
// turning back, the left page flips over to the right. Its front is the page being turned away
// and its back is the new page on the other side.
function TurningLeaf({ actions, current, labels, onComplete, turn, uiFor }) {
  const leafRef = useRef(null)
  const [flipped, setFlipped] = useState(false)

  // The leaf starts flat on the page. Reading the layout makes the browser apply that look
  // before the next step flips it over (otherwise there would be nothing to animate from).
  useEffect(() => {
    leafRef.current?.getBoundingClientRect()
    const timer = setTimeout(() => setFlipped(true), 0)
    return () => clearTimeout(timer)
  }, [])

  function handleTransitionEnd(event) {
    if (event.target === event.currentTarget && event.propertyName === 'transform') onComplete()
  }

  // Turning forward the right page flips over (its back is the new left page);
  // turning back the left page flips over (its back is the new right page).
  const forward = turn.direction === 'next'
  const front = { model: forward ? current.right : current.left, side: forward ? 'right' : 'left' }
  const back = { model: forward ? turn.left : turn.right, side: forward ? 'left' : 'right' }

  return (
    <div
      className={`book-leaf book-leaf--${turn.direction}${flipped ? ' is-flipped' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      ref={leafRef}
    >
      <div className="leaf-face leaf-face--front" inert>
        <EntryView actions={actions} labels={labels} model={front.model} side={front.side} turn={null} ui={uiFor(front.model)} />
      </div>
      <div className="leaf-face leaf-face--back" inert>
        <EntryView actions={actions} labels={labels} model={back.model} side={back.side} turn={null} ui={uiFor(back.model)} />
      </div>
    </div>
  )
}

export function ScrapbookView({
  initialEditDate = null,
  initiallyOpen = false,
  model,
  onAddScrap,
  onAddSticker,
  onDeleteScrap,
  onMarkMilestone,
  onMoveScrap,
  onMoveSticker,
  onRemoveSticker,
  onTurnComplete,
  onTurnPage,
  onUnmarkMilestone,
  onUpdateScrap,
  spread: pages,
  turn = null,
}) {
  const { cover, spread, ideaPocket } = model
  const [topPolaroid, lowerPolaroid] = cover.polaroids
  // The pocket starts closed: no idea is chosen until a card is tapped
  const [openIdeaId, setOpenIdeaId] = useState(null)
  // The book starts closed; opening slides it to the right and turns the cover to show the pages.
  // phase: closed -> opening (animating) -> open (animation done, drawn flat so the text is sharp)
  //        open -> unsettling (back in 3D, standing still) -> closed (animating back)
  const [phase, setPhase] = useState(initiallyOpen ? 'open' : 'closed')
  const isOpen = phase !== 'closed'
  const flipperRef = useRef(null)

  // Which scrap is tapped, and which entry is being edited. Each page of the book is its own
  // entry, so only the entry whose edit button was pressed goes into edit mode.
  const [selection, setSelection] = useState({ date: null, id: null })
  const [editDate, setEditDate] = useState(initialEditDate)
  // the popup that is open: { type: 'scrap' | 'milestone' | 'sticker', date, scrap?, variant? }
  const [modal, setModal] = useState(null)

  const clearSelection = () => setSelection({ date: null, id: null })

  // what each page needs to know about itself
  const uiFor = (page) => ({
    selectedScrapId: page && selection.date === page.date ? selection.id : null,
    editing: Boolean(page) && editDate === page.date,
  })

  // everything a tap on a page can do; the pages (EntryView) only call these
  const actions = {
    selectScrap: (date, id) => setSelection({ date, id }),
    toggleEdit: (date) => {
      setEditDate(editDate === date ? null : date)
      clearSelection()
    },
    addScrap: (date, variant) => setModal({ type: 'scrap', date, variant }),
    addSticker: (date) => setModal({ type: 'sticker', date }),
    editScrap: (date, scrap) => setModal({ type: 'scrap', date, scrap }),
    markMilestone: (date, scrap) => setModal({ type: 'milestone', date, scrap }),
    unmarkMilestone: (scrap) => {
      clearSelection()
      onUnmarkMilestone(scrap)
    },
    deleteScrap: (scrap) => {
      clearSelection()
      onDeleteScrap(scrap)
    },
    moveScrap: (scrap, direction) => onMoveScrap(scrap.id, direction),
    moveSticker: onMoveSticker,
    removeSticker: onRemoveSticker,
    turnPage: (leftDate) => handleTurnPage(leftDate),
  }

  function openBook() {
    setPhase('opening')
  }

  function closeBook() {
    if (phase === 'open') {
      // go back to 3D first (see the effect below), so the cover can turn back smoothly
      setPhase('unsettling')
    } else if (phase === 'opening') {
      setPhase('closed')
    }
  }

  // In 'unsettling' the book looks the same as when open, but drawn in 3D again. Reading the
  // layout forces the browser to apply that look before 'closed' starts the animation back.
  useEffect(() => {
    if (phase !== 'unsettling') return undefined
    flipperRef.current?.getBoundingClientRect()
    const timer = setTimeout(() => setPhase('closed'), 0)
    return () => clearTimeout(timer)
  }, [phase])

  // Closing the book in the middle of a turn finishes the turn right away
  useEffect(() => {
    if (turn && phase === 'closed') onTurnComplete()
  }, [turn, phase, onTurnComplete])

  // the corners only work once the book is open and no page is already turning
  function handleTurnPage(leftDate) {
    if (phase === 'open' && !turn) onTurnPage(leftDate)
  }

  // While turning forward the new right page waits under the leaf (backward: the new left page)
  const leftModel = turn?.direction === 'previous' ? turn.left : pages.left
  const rightModel = turn?.direction === 'next' ? turn.right : pages.right
  const { labels } = pages

  function handleFlipEnd(event) {
    if (event.target === event.currentTarget && event.propertyName === 'transform') {
      setPhase((current) => (current === 'opening' ? 'open' : current))
    }
  }
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
          {isOpen && (
            <button className="outline-pill-button" onClick={closeBook} type="button">
              <NavIcon name="close" size={18} />
              {model.closeBookLabel}
            </button>
          )}
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

      <div
        className={[
          'scrapbook-body',
          isOpen && 'is-open',
          phase === 'open' && 'is-settled',
          phase === 'unsettling' && 'is-unsettling',
          turn && 'is-turning',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* ===== The book ===== */}
        <div className="book" style={{ '--cover': cover.color }}>
          {/* right-hand page, under the cover */}
          <div className="book-pages-edge" />
          <div className="book-pages" />
          <div className="book-page-face book-page-face--right" inert={!isOpen}>
            <EntryView
              actions={actions}
              labels={labels}
              model={rightModel}
              side="right"
              turn={pages.turn.next}
              ui={uiFor(rightModel)}
            />
          </div>

          {/* the cover turns on its spine: front = cover, back = left-hand page */}
          <div className="book-flipper" onTransitionEnd={handleFlipEnd} ref={flipperRef}>
            <div className="book-face book-face--front" inert={isOpen}>
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
              <button aria-label={cover.openAriaLabel} className="open-corner" onClick={openBook} type="button">
                <span aria-hidden="true" className="open-corner-glow" />
                <span aria-hidden="true" className="open-corner-peel">
                  <span className="open-corner-paper" />
                </span>
              </button>
            </div>
            <div className="book-face book-face--back" inert={!isOpen}>
              <EntryView
                actions={actions}
                labels={labels}
                model={leftModel}
                side="left"
                turn={pages.turn.previous}
                ui={uiFor(leftModel)}
              />
            </div>
          </div>

          {/* the leaf that turns: front = the page being turned away, back = the new page on the other side */}
          {turn && (
            <TurningLeaf
              actions={actions}
              current={pages}
              key={turn.leftDate}
              labels={labels}
              onComplete={onTurnComplete}
              turn={turn}
              uiFor={uiFor}
            />
          )}

          {/* the edit tools of the entry being edited, under the book (hidden while a page turns) */}
          {phase === 'open' && !turn && editDate && (
            <EditBar actions={actions} date={editDate} labels={labels} />
          )}
        </div>

        {/* ===== Right column ===== */}
        <div className="scrapbook-side" inert={isOpen}>
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

      {modal?.type === 'scrap' && (
        <ScrapFormModal
          kinds={pages.kinds}
          onClose={() => setModal(null)}
          onSave={async (fields) => {
            if (modal.scrap) await onUpdateScrap(modal.scrap.id, { kind: fields.kind, text: fields.text })
            else await onAddScrap(modal.date, fields)
            clearSelection()
            setModal(null)
          }}
          scrap={modal.scrap}
          variant={modal.variant}
        />
      )}

      {modal?.type === 'milestone' && (
        <MilestoneModal
          colors={pages.milestoneColors}
          initialTitle={milestoneTitleFor(modal.scrap)}
          onClose={() => setModal(null)}
          onSave={(fields) => {
            onMarkMilestone(modal.date, modal.scrap, fields)
            clearSelection()
            setModal(null)
          }}
        />
      )}

      {modal?.type === 'sticker' && (
        <StickerModal
          onClose={() => setModal(null)}
          onPick={(stickerId) => {
            onAddSticker(modal.date, stickerId)
            setModal(null)
          }}
        />
      )}

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
