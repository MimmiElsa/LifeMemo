import { useEffect, useState } from 'react'
import { AudioPicker, PhotoPicker } from './MediaPickers.jsx'
import { NavIcon } from './NavIcon.jsx'
import { StickerArt } from './stickerCatalog.jsx'
import { STICKERS } from './stickerList.js'

// A popup over the app, like the idea popup: closes with Escape or a tap outside it.
function Modal({ children, onClose, title }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="idea-modal-backdrop" onClick={onClose}>
      <div
        aria-label={title}
        aria-modal="true"
        className="idea-modal form-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        style={{ '--idea-color': '#c3b1ff' }}
      >
        <button aria-label="Close" className="idea-modal-close" onClick={onClose} type="button">
          <NavIcon name="close" size={18} />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

// Add a scrap to a page, or change one.
//   scrap:    the scrap being changed (leave out to add a new one)
//   variant:  when adding: 'text' (words), 'photo', 'video', 'audio' (a voice note) or 'media'
//             (a photo or a video); anything but text can come with a few words
//   kinds:    [{ id, label }]
//   recorder: the camera and microphone functions, for the buttons that record
export function ScrapFormModal({ kinds, mediaLabels, onClose, onSave, recorder, scrap, variant = 'text' }) {
  const isEdit = Boolean(scrap)
  const hasFile = !isEdit && variant !== 'text'
  const [kind, setKind] = useState(scrap?.kind ?? 'memory')
  const [text, setText] = useState(scrap?.text ?? '')
  const [file, setFile] = useState(null)
  // a photo, video or voice note needs its file; words need some words
  const canSave = hasFile ? Boolean(file) : text.trim() !== ''

  function handleSubmit(event) {
    event.preventDefault()
    if (canSave) onSave({ kind, text: text.trim(), file })
  }

  const titles = {
    text: 'Add some text',
    photo: 'Add a photo',
    video: 'Add a video',
    audio: 'Add a voice note',
    media: 'Add a photo or video',
  }
  const fieldNames = { photo: 'Photo', video: 'Video', audio: 'Voice note', media: 'Photo or video' }
  const pickerMode = { photo: 'photo', video: 'video', media: 'any' }[variant]

  return (
    <Modal onClose={onClose} title={isEdit ? 'Edit scrap' : titles[variant]}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="modal-chips" role="radiogroup">
          {kinds.map((item) => (
            <button
              aria-checked={kind === item.id}
              className={`modal-chip${kind === item.id ? ' is-selected' : ''}`}
              key={item.id}
              onClick={() => setKind(item.id)}
              role="radio"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {hasFile && (
          <div className="modal-field">
            <span>{fieldNames[variant]}</span>
            {variant === 'audio' ? (
              <AudioPicker labels={mediaLabels} onChange={setFile} recorder={recorder} value={file} />
            ) : (
              <PhotoPicker labels={mediaLabels} mode={pickerMode} onChange={setFile} recorder={recorder} value={file} />
            )}
          </div>
        )}
        <label className="modal-field">
          <span>{hasFile ? 'Words to go with it (optional)' : 'What happened?'}</span>
          <textarea
            autoFocus={!hasFile}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write a few words..."
            rows={hasFile ? 3 : 4}
            value={text}
          />
        </label>

        <div className="idea-actions">
          <button className="dark-pill-button dark-pill-button--large" disabled={!canSave} type="submit">
            {isEdit ? 'Save' : 'Add to page'}
          </button>
          <button className="outline-pill-button" onClick={onClose} type="button">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Mark a scrap as a milestone: choose its name and its colour in the tower
export function MilestoneModal({ colors, initialTitle, onClose, onSave }) {
  const [title, setTitle] = useState(initialTitle)
  const [color, setColor] = useState(colors[0])

  function handleSubmit(event) {
    event.preventDefault()
    if (title.trim()) onSave({ title: title.trim(), color })
  }

  return (
    <Modal onClose={onClose} title="Add to milestones">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label className="modal-field">
          <span>Name of the milestone</span>
          <input autoFocus maxLength={40} onChange={(event) => setTitle(event.target.value)} type="text" value={title} />
        </label>

        <div className="modal-field">
          <span>Colour of its block</span>
          <div className="modal-colors" role="radiogroup">
            {colors.map((item) => (
              <button
                aria-checked={color === item}
                aria-label={item}
                className={`modal-color${color === item ? ' is-selected' : ''}`}
                key={item}
                onClick={() => setColor(item)}
                role="radio"
                style={{ background: item }}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="idea-actions">
          <button className="dark-pill-button dark-pill-button--large" disabled={!title.trim()} type="submit">
            Add to tower
          </button>
          <button className="outline-pill-button" onClick={onClose} type="button">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Pick a sticker to stick on the page
export function StickerModal({ onClose, onPick }) {
  return (
    <Modal onClose={onClose} title="Pick a sticker">
      <div className="sticker-grid">
        {STICKERS.map((item) => (
          <button className="sticker-choice" key={item.id} onClick={() => onPick(item.id)} type="button">
            <StickerArt id={item.id} size={64} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
