import { useCallback, useEffect, useRef, useState } from 'react'
import { NavIcon } from './NavIcon.jsx'

const SCROLL_STEP = 260

function SparkleIcon({ size = 14 }) {
  return (
    <svg aria-hidden="true" fill="#3D8BFD" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  )
}

function HeartIcon({ size = 14 }) {
  return (
    <svg aria-hidden="true" fill="#E0573A" height={size} viewBox="0 0 24 24" width={size}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

function DateLabel({ block }) {
  return (
    <span className="tower-date">
      <span className="tower-date-day">{block.dateLabel}</span>
      <span className="tower-date-age">{block.ageLabel}</span>
    </span>
  )
}

function TowerBlock({ block }) {
  return (
    <div className="tower-row">
      <div className="tower-side tower-side--left">
        {block.side === 'left' && (
          <>
            <DateLabel block={block} />
            <span className="tower-connector" />
          </>
        )}
      </div>

      <div className="tower-center">
        <button
          className={`tower-block${block.isUpcoming ? ' tower-block--upcoming' : ''}`}
          style={{
            '--block-color': block.color,
            '--block-width': `${block.width}px`,
            '--block-transform': `translateX(${block.shift}px) rotate(${block.tilt}deg)`,
          }}
          type="button"
        >
          <span className="tower-block-badge">
            {block.isSuggested ? <SparkleIcon size={16} /> : <HeartIcon size={15} />}
          </span>
          <span className="tower-block-title">{block.title}</span>
        </button>
      </div>

      <div className="tower-side tower-side--right">
        {block.side === 'right' && (
          <>
            <span className="tower-connector" />
            <DateLabel block={block} />
          </>
        )}
      </div>
    </div>
  )
}

export function MilestonesView({ model }) {
  const towerRef = useRef(null)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(true)

  // Show the "Newer" / "Older" buttons only when there is more to scroll to
  const measure = useCallback(() => {
    const tower = towerRef.current
    if (!tower) return
    setAtTop(tower.scrollTop <= 4)
    setAtBottom(tower.scrollTop + tower.clientHeight >= tower.scrollHeight - 4)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, model.rows.length])

  function scrollTower(direction) {
    towerRef.current?.scrollBy({ top: direction * SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <section className="milestones-page">
      <header className="milestones-header">
        <div>
          <div className="milestones-eyebrow">{model.pageLabel}</div>
          <h1 className="milestones-title">{model.pageTitle}</h1>
        </div>

        <div className="milestones-header-actions">
          <span className="legend-chip">
            <SparkleIcon />
            {model.legend.suggested}
          </span>
          <span className="legend-chip">
            <HeartIcon />
            {model.legend.userAdded}
          </span>
          <button className="add-milestone-button" type="button">
            <NavIcon name="plus" size={15} />
            {model.addLabel}
          </button>
        </div>
      </header>

      <div className="tower-frame">
        {/* newest on top; scrolls without a visible scrollbar */}
        <div className="tower" onScroll={measure} ref={towerRef}>
          <div className="tower-content">
            {model.rows.map((row) =>
              row.type === 'today' ? (
                <div className="tower-today" key={row.id}>
                  <span className="tower-today-line" />
                  <span className="tower-today-label">{row.label}</span>
                  <span className="tower-today-line" />
                </div>
              ) : (
                <TowerBlock block={row} key={row.id} />
              ),
            )}

            {model.isEmpty && <p className="tower-empty">{model.emptyLabel}</p>}

            <div className="tower-ground">
              <div className="tower-ground-bar" />
              <div aria-hidden="true" className="tower-friend">
                <div className="tower-friend-eye tower-friend-eye--left"><span /></div>
                <div className="tower-friend-eye tower-friend-eye--right"><span /></div>
                <div className="tower-friend-mouth" />
              </div>
            </div>
          </div>
        </div>

        {!atTop && (
          <div className="tower-fade tower-fade--top">
            <button className="tower-more-button" onClick={() => scrollTower(-1)} type="button">
              <NavIcon name="chevron-up" size={16} />
              {model.newerLabel}
            </button>
          </div>
        )}

        {!atBottom && (
          <div className="tower-fade tower-fade--bottom">
            <button className="tower-more-button" onClick={() => scrollTower(1)} type="button">
              <NavIcon name="chevron-down" size={16} />
              {model.olderLabel}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
