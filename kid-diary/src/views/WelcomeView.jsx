import logo from '../logo.js'

export function WelcomeView({ model, onContinue }) {
  return (
    <main className="welcome-screen">
      <div className="welcome-image" aria-hidden="true" />

      <section className="welcome-content">
        <img className="welcome-logo" src={logo} alt={model.appName} />
        <h1 className="welcome-tagline">{model.tagline}</h1>

        <div className="welcome-actions">
          <button className="button-primary" onClick={onContinue} type="button">
            {model.startLabel} →
          </button>
          <button className="button-secondary" onClick={onContinue} type="button">
            {model.accountLabel}
          </button>
        </div>
      </section>
    </main>
  )
}
