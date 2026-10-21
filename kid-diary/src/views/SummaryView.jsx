import blueSmile from '../../assets/stickers/blue-smile@3x 1.png'
import pinkWink from '../../assets/stickers/pink-wink@3x 1.png'
import { MOOD_FACES } from './moodFaces.js'
import yellowOpen from '../../assets/stickers/yellow-open@3x 1.png'
import { NavIcon } from './NavIcon.jsx'

// One card on a page. Each kind of card has its own look.
function SummaryCard({ card, tilt }) {
  const style = { '--tilt': `${tilt}deg` }

  switch (card.type) {
    case 'milestone':
      return (
        <article
          className="sum-card sum-card--milestone"
          style={{ ...style, '--milestone-color': card.color }}
        >
          <img alt="" aria-hidden="true" className="sum-card-sticker" src={blueSmile} />
          <span className="sum-card-label">{card.label}</span>
          <span className="sum-card-date">{card.dateLabel}</span>
          <h3>{card.title}</h3>
          <p>{card.text}</p>
        </article>
      )
    case 'mood':
      return (
        <article className={`sum-card sum-card--mood sum-card--mood-${card.mood}`} style={style}>
          <img alt="" aria-hidden="true" className="sum-card-sticker" src={MOOD_FACES[card.mood] ?? pinkWink} />
          <span className="sum-card-label">{card.label}</span>
          <h3>{card.title}</h3>
        </article>
      )
    case 'photo':
      return (
        <article className="sum-card sum-card--photo" style={style}>
          {card.mediaKind === 'video' ? (
            <video controls src={card.url} />
          ) : (
            <img alt={card.name} src={card.url} />
          )}
          <strong>{card.dateLabel}</strong>
          {card.text && <span>{card.text}</span>}
        </article>
      )
    case 'note':
      return (
        <article className="sum-card sum-card--note" style={style}>
          <span className="sum-card-date">{card.dateLabel}</span>
          <p>{card.text}</p>
        </article>
      )
    case 'label':
      return (
        <article className={`sum-card sum-card--label sum-card--${card.kind}`} style={style}>
          <span className="sum-card-label">
            {card.label} &middot; {card.dateLabel}
          </span>
          <h3>{card.title}</h3>
        </article>
      )
    case 'stats':
      return (
        <article className="sum-card sum-card--stats" style={style}>
          <span className="sum-card-label">{card.label}</span>
          <ul>
            {card.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      )
    default:
      return (
        <article className="sum-card sum-card--hint" style={style}>
          <p>{card.text}</p>
        </article>
      )
  }
}

// Gentle tilts, so the cards look stuck on by hand. Polaroids and notes tilt more than the cards.
const TILTS = [-1.2, 1, -0.6, 1.4, -1, 0.7]

// The full-page look back at one month, as one page of cards: the milestones come
// first, then how the month felt and a few random scraps.
export function SummaryView({ model, onBack, onShuffle }) {
  return (
    <section className="summary-page">
      <header className="summary-header">
        <button className="outline-pill-button" onClick={onBack} type="button">
          <NavIcon name="chevron-left" size={16} />
          {model.backLabel}
        </button>

        <div className="summary-banner">
          <span className="summary-eyebrow">{model.eyebrow}</span>
          <h1>{model.title}</h1>
          <p>{model.subtitle}</p>
        </div>

        <button className="outline-pill-button" onClick={onShuffle} type="button">
          <NavIcon name="shuffle" size={16} />
          {model.shuffleLabel}
        </button>
      </header>

      {model.isLoading ? null : model.isEmpty ? (
        <div className="summary-blank">
          <img alt="" aria-hidden="true" src={pinkWink} />
          <h2>{model.blank.title}</h2>
          <p>{model.blank.hint}</p>
        </div>
      ) : (
        <div className="summary-board">
          {model.cards.map((card, index) => (
            <SummaryCard card={card} key={card.id} tilt={TILTS[index % TILTS.length]} />
          ))}
          <img alt="" aria-hidden="true" className="summary-corner-sticker" src={yellowOpen} />
        </div>
      )}
    </section>
  )
}
