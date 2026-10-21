import { useRef, useState } from 'react'
import { readFileAsDataUrl } from '../backend/utils/files.js'

export function SettingsView({ model, onSave, onThemeChange }) {
  const [name, setName] = useState(model.values.name)
  const [birthday, setBirthday] = useState(model.values.birthday)
  const [photo, setPhoto] = useState(model.values.photo)
  const [saved, setSaved] = useState(false)
  const fileInput = useRef(null)

  const canSave = model.hasChild && name.trim() !== ''

  function edit(setter) {
    return (value) => {
      setter(value)
      setSaved(false)
    }
  }

  async function handlePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    edit(setPhoto)(await readFileAsDataUrl(file))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSave) return
    onSave({ name: name.trim(), birthday: birthday || null, photo })
    setSaved(true)
  }

  return (
    <section className="settings-page">
      <header className="settings-header">
        <h1>{model.title}</h1>
        <p>{model.subtitle}</p>
      </header>

      <form className="settings-card" onSubmit={handleSubmit}>
        <h2>{model.profileTitle}</h2>

        <div className="settings-photo-row">
          <div className="settings-photo" aria-hidden="true">
            {photo ? <img alt="" src={photo} /> : <span>{model.initial}</span>}
          </div>
          <div className="settings-photo-text">
            <strong>{model.photoLabel}</strong>
            <small>{model.photoHint}</small>
            <div className="settings-photo-actions">
              <button
                className="settings-chip"
                disabled={!model.hasChild}
                onClick={() => fileInput.current?.click()}
                type="button"
              >
                {photo ? model.changePhotoLabel : model.choosePhotoLabel}
              </button>
              {photo && (
                <button className="settings-chip" onClick={() => edit(setPhoto)(null)} type="button">
                  {model.removePhotoLabel}
                </button>
              )}
            </div>
            <input accept="image/*" hidden onChange={handlePhoto} ref={fileInput} type="file" />
          </div>
        </div>

        <label className="settings-field">
          <span>{model.nameLabel}</span>
          <input
            disabled={!model.hasChild}
            onChange={(event) => edit(setName)(event.target.value)}
            type="text"
            value={name}
          />
        </label>

        <label className="settings-field">
          <span>{model.birthdayLabel}</span>
          <input
            disabled={!model.hasChild}
            max={model.latestBirthday}
            onChange={(event) => edit(setBirthday)(event.target.value)}
            type="date"
            value={birthday ?? ''}
          />
        </label>

        <div className="settings-save-row">
          <button className="button-primary" disabled={!canSave} type="submit">
            {model.saveLabel}
          </button>
          {saved && (
            <span className="settings-saved" role="status">
              ✓ {model.savedLabel}
            </span>
          )}
        </div>
      </form>

      <div className="settings-card">
        <h2>{model.appearanceTitle}</h2>
        <div className="settings-field">
          <span>{model.themeLabel}</span>
          <div className="theme-toggle" role="radiogroup" aria-label={model.themeLabel}>
            {model.themeOptions.map((option) => (
              <button
                aria-checked={option.id === model.theme}
                className={`theme-option${option.id === model.theme ? ' theme-option--active' : ''}`}
                key={option.id}
                onClick={() => onThemeChange(option.id)}
                role="radio"
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
