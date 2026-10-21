import { useState } from 'react'
import blankFriend from '../../assets/stickers/pink-wink@3x 1.png'
import { NavIcon } from './NavIcon.jsx'
import { StickerLayer } from './StickerLayer.jsx'

// One page of the open scrapbook: one entry (the page of one day) with the scraps on it and the
// stickers stuck on it. The book shows two pages side by side, each its own entry, so each page
// has its own edit button. A page with no scraps yet shows a friendly "still blank" note.
//
//   model:   the entry to show, or null for a side of the book that has no page
//   side:    'left' or 'right'
//   turn:    where the corner of this page turns to: { label, date } (date is null when nowhere)
//   ui:      { selectedScrapId, editing } for this entry
//   labels:  the words used on the pages
//   actions: what a tap on a scrap, a menu button or an edit button does (see ScrapbookView)

// The three choices next to a selected scrap
function ScrapMenu({ actions, date, labels, scrap }) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="scrap-menu" onClick={(event) => event.stopPropagation()}>
        <span className="scrap-menu-question">{labels.confirmDelete}</span>
        <button className="scrap-menu-button scrap-menu-button--danger" onClick={() => actions.deleteScrap(scrap)} type="button">
          <NavIcon name="trash" size={16} />
          {labels.deleteScrap}
        </button>
        <button className="scrap-menu-button" onClick={() => setConfirming(false)} type="button">
          {labels.keep}
        </button>
      </div>
    )
  }

  return (
    <div className="scrap-menu" onClick={(event) => event.stopPropagation()}>
      <button
        className="scrap-menu-button"
        onClick={() => (scrap.isMilestone ? actions.unmarkMilestone(scrap) : actions.markMilestone(date, scrap))}
        type="button"
      >
        <NavIcon name="blocks" size={16} />
        {scrap.isMilestone ? labels.removeFromMilestones : labels.addToMilestone}
      </button>
      <button className="scrap-menu-button" onClick={() => actions.editScrap(date, scrap)} type="button">
        <NavIcon name="pencil" size={16} />
        {labels.editScrap}
      </button>
      <button className="scrap-menu-button scrap-menu-button--danger" onClick={() => setConfirming(true)} type="button">
        <NavIcon name="trash" size={16} />
        {labels.deleteScrap}
      </button>
    </div>
  )
}

function Scrap({ actions, date, editing, labels, scrap, selected }) {
  const hasMedia = scrap.media.length > 0
  const classes = [
    'scrap',
    hasMedia ? 'scrap--media' : 'scrap--text',
    scrap.isMilestone && 'scrap--milestone',
    scrap.isHighlighted && 'scrap--highlight',
    selected && 'scrap--selected',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="scrap-slot">
      {editing && (
        <div className="scrap-mover">
          <button
            aria-label={labels.moveUp}
            disabled={!scrap.canMoveUp}
            onClick={(event) => {
              event.stopPropagation()
              actions.moveScrap(scrap, -1)
            }}
            type="button"
          >
            <NavIcon name="chevron-up" size={16} />
          </button>
          <button
            aria-label={labels.moveDown}
            disabled={!scrap.canMoveDown}
            onClick={(event) => {
              event.stopPropagation()
              actions.moveScrap(scrap, 1)
            }}
            type="button"
          >
            <NavIcon name="chevron-down" size={16} />
          </button>
        </div>
      )}

      <article
        aria-pressed={selected}
        className={classes}
        onClick={(event) => {
          event.stopPropagation()
          actions.selectScrap(date, selected ? null : scrap.id)
        }}
      >
        {hasMedia &&
          scrap.media.map((item) =>
            item.kind === 'video' ? (
              <video controls key={item.id} src={item.url} />
            ) : (
              <img alt={item.name} key={item.id} src={item.url} />
            ),
          )}
        <span className="scrap-label">
          {scrap.isMilestone && <NavIcon name="blocks" size={13} />}
          {scrap.label}
          {scrap.isMilestone && scrap.milestoneTitle ? ` · ${scrap.milestoneTitle}` : ''}
        </span>
        {scrap.text && <p>{scrap.text}</p>}
      </article>

      {selected && <ScrapMenu actions={actions} date={date} labels={labels} scrap={scrap} />}
    </div>
  )
}

// The folded corner at the bottom of a page: still, and only there when there is a page to turn to
function PageTurner({ actions, direction, turn }) {
  if (!turn?.date) return null

  return (
    <button
      aria-label={turn.label}
      className={`page-turner page-turner--${direction}`}
      onClick={(event) => {
        event.stopPropagation()
        actions.turnPage(turn.date)
      }}
      type="button"
    >
      <NavIcon name={direction === 'previous' ? 'chevron-left' : 'chevron-right'} size={18} />
    </button>
  )
}

export function EntryView({ actions, labels, model, side, turn, ui }) {
  const direction = side === 'left' ? 'previous' : 'next'

  // a side of the book without a page: just blank paper
  if (!model) {
    return <div className={`entry-page entry-page--${side} entry-page--empty`} />
  }

  return (
    <div className={`entry-page entry-page--${side}`} onClick={() => actions.selectScrap(model.date, null)}>
      <header className="entry-header">
        <h2>{model.dateLabel}</h2>
        <button
          aria-pressed={ui.editing}
          className={`entry-edit-button${ui.editing ? ' is-active' : ''}`}
          onClick={(event) => {
            event.stopPropagation()
            actions.toggleEdit(model.date)
          }}
          type="button"
        >
          <NavIcon name="pencil" size={14} />
          {labels.editEntry}
        </button>
      </header>

      {model.isEmpty && (
        <div className="entry-blank">
          <img alt="" aria-hidden="true" className="entry-blank-friend" src={blankFriend} />
          <h3>{model.blank.title}</h3>
          <p>{model.blank.hint}</p>
          <button
            className="entry-blank-button"
            onClick={(event) => {
              event.stopPropagation()
              actions.newMemory(model.date)
            }}
            type="button"
          >
            <NavIcon name="plus" size={16} />
            {model.blank.addLabel}
          </button>
        </div>
      )}

      <div className="entry-scraps">
        {model.scraps.map((scrap) => (
          <Scrap
            actions={actions}
            date={model.date}
            editing={ui.editing}
            key={scrap.id}
            labels={labels}
            scrap={scrap}
            selected={ui.selectedScrapId === scrap.id}
          />
        ))}
      </div>

      {/* stickers stuck on this page; they can be dragged while the page is being edited */}
      <StickerLayer
        editing={ui.editing}
        onMove={(stickerId, x, y) => actions.moveSticker(model.entryId, stickerId, x, y)}
        onRemove={(stickerId) => actions.removeSticker(model.entryId, stickerId)}
        removeLabel={labels.removeSticker}
        stickers={model.stickers}
      />

      <PageTurner actions={actions} direction={direction} turn={turn} />
    </div>
  )
}
