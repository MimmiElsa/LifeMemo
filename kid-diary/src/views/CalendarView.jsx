import winkSticker from '../../assets/stickers/pink-wink@3x 1.png'
import { NavIcon } from './NavIcon.jsx'

function dayClassName(cell) {
  const classes = ['calendar-day']
  if (!cell.inMonth) classes.push('calendar-day--outside')
  if (cell.hasEntry) classes.push('calendar-day--has-entry')
  if (cell.mood) classes.push(`calendar-day--${cell.mood}`)
  if (cell.isToday) classes.push('calendar-day--today')
  if (cell.isSelected) classes.push('calendar-day--selected')
  return classes.join(' ')
}

export function CalendarView({
  model,
  onNextMonth,
  onOpenSummary,
  onPreviousMonth,
  onSelectDate,
  onStartEntry,
  onViewEntry,
}) {
  const { day } = model

  return (
    <section className="calendar-page">
      <header className="calendar-header">
        <h1 className="calendar-title">
          {model.monthName} <span>{model.yearLabel}</span>
        </h1>
        <div className="calendar-nav">
          <button aria-label={model.previousLabel} className="calendar-nav-button" onClick={onPreviousMonth} type="button">
            <NavIcon name="chevron-left" size={18} />
          </button>
          <button aria-label={model.nextLabel} className="calendar-nav-button" onClick={onNextMonth} type="button">
            <NavIcon name="chevron-right" size={18} />
          </button>
        </div>
      </header>

      <div className="calendar-body">
        <div className="calendar-card">
          <div className="calendar-weekdays">
            {model.weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {model.cells.map((cell) => (
              <button
                aria-pressed={cell.isSelected}
                className={dayClassName(cell)}
                disabled={!cell.inMonth}
                key={cell.date}
                onClick={() => onSelectDate(cell.date)}
                type="button"
              >
                {cell.dayOfMonth}
              </button>
            ))}
          </div>

          <p className="calendar-legend">{model.legend}</p>
        </div>

        <aside className="calendar-side">
          <div className="summary-card">
            <img alt="" aria-hidden="true" className="summary-card-sticker" src={winkSticker} />
            <div className="summary-card-eyebrow">{model.summary.eyebrow}</div>
            <div className="summary-card-title">{model.summary.title}</div>
            <button className="summary-card-button" onClick={onOpenSummary} type="button">
              <NavIcon name="arrow-right" size={14} />
              {model.summary.openLabel}
            </button>
          </div>

          <div className="day-card">
            {day ? (
              <>
                <div className="day-card-weekday">{day.weekday}</div>
                <h2 className="day-card-date">{day.dateLabel}</h2>

                {day.hasEntry ? (
                  <ul className="day-scraps">
                    {day.scraps.map((scrap) => (
                      <li key={scrap.id}>
                        <button
                          className="day-scrap"
                          onClick={() => onViewEntry(day.date, scrap.id)}
                          type="button"
                        >
                          <span className={`day-scrap-swatch day-scrap-swatch--${scrap.isMilestone ? 'milestone' : scrap.kind}`} />
                          <span className="day-scrap-text">
                            <small>{scrap.label}</small>
                            <strong>{scrap.text}</strong>
                          </span>
                          <NavIcon name="chevron-right" size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="day-card-empty-state">
                    <p className="day-card-empty">{day.emptyLabel}</p>
                    {day.canStartEntry ? (
                      <>
                        <p className="day-card-hint">{day.startEntryHint}</p>
                        <button className="start-entry-button" onClick={() => onStartEntry(day.date)} type="button">
                          <NavIcon name="plus" size={16} />
                          {day.startEntryLabel}
                        </button>
                      </>
                    ) : (
                      <p className="day-card-hint">{day.futureLabel}</p>
                    )}
                  </div>
                )}

                {day.hasEntry && (
                  <button className="view-entry-button" onClick={() => onViewEntry(day.date)} type="button">
                    {day.viewEntryLabel}
                    <NavIcon name="arrow-right" size={16} />
                  </button>
                )}
              </>
            ) : (
              <p className="day-card-empty">{model.placeholder}</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
