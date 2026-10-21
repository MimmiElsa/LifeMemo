import { useState } from 'react'
import { canSaveMemory } from '../backend/memoryTemplates.js'
import { NavIcon } from './NavIcon.jsx'

// A photo or video answer: choose a file, or take a photo with the camera
function PhotoField({ field, model, onChange, onTakePhoto, value }) {
  const [error, setError] = useState('')

  async function takePhoto() {
    setError('')
    try {
      onChange(await onTakePhoto())
    } catch (caught) {
      setError(caught.message)
    }
  }

  return (
    <div className="answer-card answer-card--photo">
      <span className="answer-label">{field.label}</span>
      {value ? (
        <div className="answer-photo-chosen">
          <span>{value.name || 'Photo from the camera'}</span>
          <button className="answer-link" onClick={() => onChange(null)} type="button">
            {model.removePhotoLabel}
          </button>
        </div>
      ) : (
        <div className="answer-photo-choices">
          <label className="answer-pill">
            <NavIcon name="camera" size={16} />
            {model.choosePhotoLabel}
            <input
              accept="image/*,video/*"
              hidden
              onChange={(event) => onChange(event.target.files[0] ?? null)}
              type="file"
            />
          </label>
          <button className="answer-pill" onClick={takePhoto} type="button">
            <NavIcon name="camera" size={16} />
            {model.takePhotoLabel}
          </button>
        </div>
      )}
      {error && <span className="answer-error">{error}</span>}
    </div>
  )
}

// The preset questions of one template. The answers are kept here, and handed over when saved.
export function TemplateFormView({ model, onBack, onSave, onTakePhoto, template }) {
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
          if (field.type === 'photo') {
            return (
              <PhotoField
                field={field}
                key={field.id}
                model={model}
                onChange={(file) => setAnswer('photo', file)}
                onTakePhoto={onTakePhoto}
                value={answers.photo ?? null}
              />
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
