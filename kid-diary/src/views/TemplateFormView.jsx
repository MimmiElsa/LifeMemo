import { useState } from 'react'
import { canSaveMemory } from '../backend/memoryTemplates.js'
import { AudioPicker, PhotoPicker } from './MediaPickers.jsx'
import { NavIcon } from './NavIcon.jsx'

// The preset questions of one template. The answers are kept here, and handed over when saved.
export function TemplateFormView({ model, onBack, onSave, recorder, template }) {
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const canSave = canSaveMemory(template, answers) && !saving

  const setAnswer = (fieldId, value) => setAnswers((current) => ({ ...current, [fieldId]: value }))

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    await onSave(answers)
  }

  return (
    <form className="new-memory-screen" onSubmit={handleSubmit} style={{ '--template-color': model.color }}>
      <header className="new-memory-bar">
        <button aria-label={model.backLabel} className="new-memory-close" onClick={onBack} type="button">
          <NavIcon name="chevron-left" size={18} />
        </button>
        <span className="new-memory-bar-title">{model.headerTitle}</span>
      </header>

      <div className="new-memory-heading">
        <h1>{model.title}</h1>
        <p>{model.subtitle}</p>
      </div>

      <div className="answer-list">
        {model.fields.map((field) => {
          if (field.type === 'photo' || field.type === 'audio') {
            const Picker = field.type === 'photo' ? PhotoPicker : AudioPicker
            return (
              <div className="answer-card answer-card--photo" key={field.id}>
                <span className="answer-label">{field.label}</span>
                <Picker
                  labels={model.mediaLabels}
                  onChange={(file) => setAnswer(field.id, file)}
                  recorder={recorder}
                  value={answers[field.id] ?? null}
                />
              </div>
            )
          }

          const value = answers[field.id] ?? ''
          return (
            <label className={`answer-card answer-card--${field.type}`} key={field.id}>
              <span className="answer-label">
                {field.label}
                {field.required ? ' *' : ''}
              </span>
              {field.type === 'long' ? (
                <textarea
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  value={value}
                />
              ) : (
                <input
                  onChange={(event) => setAnswer(field.id, event.target.value)}
                  placeholder={field.placeholder}
                  type="text"
                  value={value}
                />
              )}
              {field.type === 'topic' && (
                <span className="answer-suggestions">
                  {field.suggestions.map((suggestion) => (
                    <button
                      className={`answer-suggestion${value === suggestion ? ' is-selected' : ''}`}
                      key={suggestion}
                      onClick={(event) => {
                        event.preventDefault()
                        setAnswer(field.id, suggestion)
                      }}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </span>
              )}
            </label>
          )
        })}
      </div>

      <div className="answer-actions">
        <button className="blank-card-button" disabled={!canSave} type="submit">
          <NavIcon name="check" size={16} />
          {model.saveLabel}
        </button>
      </div>
    </form>
  )
}
