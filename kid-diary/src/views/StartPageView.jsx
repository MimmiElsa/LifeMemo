import orangeOpen from '../../assets/stickers/orange-open@3x 2.png'
import orangeO from '../../assets/stickers/orange-o@3x 2.png'

export function StartPageView({ model, onOpenTemplate }) {
  return (
    <section className="startpage">
        <div>
          <h3>{model.todayLabel}</h3>
          <h1>{model.greeting}</h1>
        </div>
        
        <div className="dashboard">
          <div className="dashboard-left">
            <div className="daily-challenge-div">
              <div className="card-title">
                Daily challenge
              </div>
              <h2 className="card-h2">Find three red things on the way home</h2>
              <div className="card-button">
                Let's do it!
              </div>
            </div>
            <div className="interaction-div">
              <h3>What would you like to do?</h3>
              <div className="interaction-cards">
                <div
                  className="interaction-card activity-card"
                  onClick={() => onOpenTemplate('activity')}
                  onKeyDown={(event) => event.key === 'Enter' && onOpenTemplate('activity')}
                  role="button"
                  tabIndex={0}
                >
                  <h4>Activity</h4>
                  <p>Ideas to play together</p>
                </div>
                <div
                  className="interaction-card conversation-topics"
                  onClick={() => onOpenTemplate('conversation')}
                  onKeyDown={(event) => event.key === 'Enter' && onOpenTemplate('conversation')}
                  role="button"
                  tabIndex={0}
                >
                  <h4>Conversation Topics</h4>
                  <p>Scan the card to start it</p>
                </div>
                <div className="interaction-card use-illustrations">
                  <h4>Use Illustrations</h4>
                  <p>Check with pictures</p>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-right">
            <div className="this-week-div">
              <h4 className="week-title">{model.weekTitle}</h4>
              <ol className="week-days">
                {model.weekDays.map((day, index) => (
                  <li className="week-day" key={index}>
                    <span className="week-day-label">{day.label}</span>
                    <span
                      className={`week-day-number${day.isToday ? ' week-day-number--today' : ''}${day.hasEntry ? ' week-day-number--entry' : ''}`}
                    >
                      {day.dayOfMonth}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="todays-entry-div">
              <img alt="" aria-hidden="true" className="entry-sticker entry-sticker--top-right" src={orangeOpen} />
              <img alt="" aria-hidden="true" className="entry-sticker entry-sticker--bottom-left" src={orangeO} />
              <h2>{model.todaysPage.title}</h2>
              <p>{model.todaysPage.description}</p>
              <button className="add-to-today-button" type="button">
                {model.todaysPage.addLabel}
              </button>
            </div>
          </div>
        </div>
    </section>
  

  )
}