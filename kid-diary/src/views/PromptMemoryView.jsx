import { useState } from 'react'
import { canSavePrompt } from '../backend/memoryTemplates.js'
import { AudioPicker } from './MediaPickers.jsx'
import { NavIcon } from './NavIcon.jsx'
import { PictureArt } from './PictureArt.jsx'
import { StepBar } from './StepBar.jsx'

// One question: tap a picture, or add a note or a voice recording
function QuestionCard({ answer, labels, onChange, question, recorder }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const chosen = question.pictures.find((picture) => picture.id === answer.picture)

  return (
    <section className="prompt-card">
      <h2>{question.label}</h2>

      <div aria-live="polite" className="prompt-preview">
        {chosen ? (
          <>
            <PictureArt option={chosen} size="large" />
            <strong>{chosen.label}</strong>
          </>
        ) : (
          <>
            <span className="prompt-preview-placeholder">
              <PictureArt option={question.pictures[0]} size="large" />
            </span>
            <small>{labels.pickOne}</small>
          </>
        )}
      </div>

      <div aria-label={question.label} className="prompt-pictures" role="radiogroup">
        {question.pictures.map((picture) => (
          <button
            aria-checked={picture.id === chosen?.id}
            aria-label={picture.label}
            className={`picture-option${picture.id === chosen?.id ? ' is-selected' : ''}`}
            key={picture.id}
            onClick={() => onChange({ picture: picture.id === chosen?.id ? null : picture.id })}
            role="radio"
            title={picture.label}
            type="button"
          >
            <PictureArt option={picture} />
          </button>
        ))}
      </div>

      <div className="prompt-actions">
        <button
          className={`prompt-action${noteOpen || answer.note ? ' is-on' : ''}`}
          onClick={() => setNoteOpen((open) => !open)}
          type="button"
        >
          <NavIcon name="pencil" size={16} />
          {labels.note}
        </button>
        <div className="prompt-voice">
          <AudioPicker
            captureOnly
            labels={{ ...labels.media, recordAudio: labels.voice }}
            onChange={(file) => onChange({ audio: file })}
            recorder={recorder}
            value={answer.audio ?? null}
          />
        </div>
      </div>

      {(noteOpen || answer.note) && (
        <textarea
          autoFocus={noteOpen && !answer.note}
          onChange={(event) => onChange({ note: event.target.value })}
          placeholder={labels.notePlaceholder}
          rows={2}
          value={answer.note ?? ''}
        />
      )}
    </section>
  )
}

// Step 2 of a new memory from an interaction card: a set of questions that were picked for the
// category, answered with pictures, notes or a voice. The answers are handed over when saved.
export function PromptMemoryView({ model, onBack, onClose, onSave, recorder, set }) {
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const canSave = canSavePrompt(set, answers) && !saving

  const change = (questionId, fields) =>
    setAnswers((current) => ({ ...current, [questionId]: { ...current[questionId], ...fields } }))

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    await onSave(answers)
  }

  return (
    <div className="new-memory-screen prompt-screen" style={{ '--template-color': model.color }}>
      <header className="new-memory-bar">
        <button aria-label={model.closeLabel} className="new-memory-close" onClick={onClose} type="button">
          <NavIcon name="close" size={18} />
        </button>
        {model.stepCount ? (
          <StepBar step={model.step} stepCount={model.stepCount} />
        ) : (
          <span className="new-memory-bar-title">{model.headerTitle}</span>
        )}
      </header>

      <div className="new-memory-heading step-heading">
        <h1>{model.title}</h1>
        <p>{model.subtitle}</p>
      </div>

      <div className="prompt-grid">
        {set.questions.map((question) => (
          <QuestionCard
            answer={answers[question.id] ?? {}}
            key={question.id}
            labels={model.labels}
            onChange={(fields) => change(question.id, fields)}
            question={question}
            recorder={recorder}
          />
        ))}
      </div>

      <footer className="step-footer">
        <button className="step-skip step-back" onClick={onBack} type="button">
          <NavIcon name="chevron-left" size={16} />
          {model.backLabel}
        </button>
        <button className="blank-card-button" disabled={!canSave} onClick={handleSave} type="button">
          {model.saveLabel}
        </button>
      </footer>
    </div>
  )
}
