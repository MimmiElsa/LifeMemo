import blankFriend from '../../assets/stickers/pink-wink@3x 1.png'
import { NavIcon } from './NavIcon.jsx'

// One page of the open scrapbook. An entry is the page of one day, and the
// items on it are scraps. The book shows two facing pages, so this renders
// either the left or the right half of the entry. A page with no scraps yet
// shows a friendly "still blank" note (on the left page, under the date).
function Scrap({ scrap, onDelete }) {
  if (scrap.type === 'text') {
    return (
      <article
        className={[
          'scrap',
          'scrap--text',
          scrap.isMilestone && 'scrap--milestone',
          scrap.isHighlighted && 'scrap--highlight',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="scrap-label">
          {scrap.isMilestone && <NavIcon name="blocks" size={13} />}
          {scrap.label}
        </span>
        <p>{scrap.text}</p>
      </article>
    )
  }

  return (
    <article className="scrap">
      {scrap.kind === 'photo' && <img alt={scrap.name} src={scrap.url} />}
      {scrap.kind === 'video' && <video controls src={scrap.url} />}
      {scrap.kind === 'audio' && <audio controls src={scrap.url} />}
      <div className="scrap-footer">
        <span className="scrap-name">{scrap.name}</span>
        <button className="scrap-delete" onClick={() => onDelete(scrap)} type="button">
          {scrap.deleteLabel}
        </button>
      </div>
    </article>
  )
}

export function EntryView({ model, onAddMemory, onDelete, onTurnPage, page }) {
  const scraps = page === 'left' ? model.leftScraps : model.rightScraps
  const direction = page === 'left' ? 'previous' : 'next'
  const turn = model.turn[direction]

  return (
    <div className={`entry-page entry-page--${page}`}>
      {page === 'left' && (
        <header className="entry-header">
          <h2>{model.dateLabel}</h2>
        </header>
      )}

      {model.isEmpty && page === 'left' && (
        <div className="entry-blank">
          <img alt="" aria-hidden="true" className="entry-blank-friend" src={blankFriend} />
          <h3>{model.blank.title}</h3>
          <p>{model.blank.hint}</p>
          <button className="entry-blank-button" onClick={onAddMemory} type="button">
            <NavIcon name="plus" size={16} />
            {model.blank.addLabel}
          </button>
        </div>
      )}

      <div className="entry-scraps">
        {scraps.map((scrap) => (
          <Scrap key={scrap.id} onDelete={onDelete} scrap={scrap} />
        ))}
      </div>

      {/* folded corner: still, it only appears where there is a page to turn to */}
      {turn.date && (
        <button
          aria-label={turn.label}
          className={`page-turner page-turner--${direction}`}
          onClick={() => onTurnPage(turn.date)}
          type="button"
        >
          <NavIcon name={direction === 'previous' ? 'chevron-left' : 'chevron-right'} size={18} />
        </button>
      )}
    </div>
  )
}
