import { useState } from 'react'
import { MOOD_FACES } from './moodFaces.js'
import { NavIcon } from './NavIcon.jsx'
import { StepBar } from './StepBar.jsx'

// Step 1 of a new memory: the child taps the colour of how they feel. The choice is today's mood,
// which tints the day in the calendar.
export function MoodStepView({ model, onClose, onContinue, onSkip }) {
  const [mood, setMood] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!mood || saving) return
    setSaving(true)
    await onContinue({ mood })
  }

  return (
    <div className="new-memory-screen mood-step">
      <header className="new-memory-bar">
        <button aria-label={model.closeLabel} className="new-memory-close" onClick={onClose} type="button">
          <NavIcon name="close" size={18} />
        </button>
        <StepBar step={model.step} stepCount={model.stepCount} />
      </header>

      <div className="new-memory-heading step-heading">
        <h1>{model.title}</h1>
        <p>{model.subtitle}</p>
      </div>

      <div aria-label={model.title} className="mood-grid" role="radiogroup">
        {model.options.map((option) => (
          <button
            aria-checked={mood === option.id}
            className={`mood-choice${mood === option.id ? ' is-selected' : ''}`}
            key={option.id}
            onClick={() => setMood(option.id)}
            role="radio"
            style={{ '--mood-color': option.color }}
            type="button"
          >
            {mood === option.id && (
              <span className="mood-check">
                <NavIcon name="check" size={12} />
              </span>
            )}
            <span aria-hidden="true" className="mood-face">
              <img alt="" src={MOOD_FACES[option.id]} />
            </span>
            {option.label}
          </button>
        ))}
      </div>

      <footer className="step-footer">
        <button className="step-skip" onClick={onSkip} type="button">
          {model.skipLabel}
        </button>
        <button className="blank-card-button" disabled={!mood || saving} onClick={handleContinue} type="button">
          <NavIcon name="arrow-right" size={16} />
          {model.continueLabel}
        </button>
      </footer>
    </div>
  )
}
