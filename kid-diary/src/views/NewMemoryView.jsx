import blueSmile from '../../assets/stickers/blue-smile@3x 1.png'
import orangeO from '../../assets/stickers/orange-o@3x 2.png'
import pinkWink from '../../assets/stickers/pink-wink@3x 1.png'
import yellowOpen from '../../assets/stickers/yellow-open@3x 1.png'
import { NavIcon } from './NavIcon.jsx'

// the face on each template's card
const TEMPLATE_STICKERS = {
  activity: { src: blueSmile, className: 'template-sticker--activity' },
  moment: { src: pinkWink, className: 'template-sticker--moment' },
  conversation: { src: orangeO, className: 'template-sticker--conversation' },
  milestone: { src: yellowOpen, className: 'template-sticker--milestone' },
}

// The first screen of a new memory: a blank page (straight to the editing tools), or one of
// the ready-made templates, which ask a few set questions.
export function NewMemoryView({ model, onClose, onPickTemplate, onStartBlank }) {
  return (
    <div className="new-memory-screen">
      <header className="new-memory-bar">
        <button aria-label={model.closeLabel} className="new-memory-close" onClick={onClose} type="button">
          <NavIcon name="close" size={18} />
        </button>
        <span className="new-memory-bar-title">{model.headerTitle}</span>
      </header>

      <div className="new-memory-heading">
        <h1>{model.title}</h1>
        <p>{model.subtitle}</p>
      </div>

      <div className="new-memory-choices">
        <section className="blank-card">
          <h2>{model.blank.title}</h2>
          <p>{model.blank.hint}</p>
          <button className="blank-card-button" onClick={onStartBlank} type="button">
            <NavIcon name="arrow-right" size={16} />
            {model.blank.startLabel}
          </button>
        </section>

        <div className="template-grid">
          {model.templates.map((template) => {
            const sticker = TEMPLATE_STICKERS[template.id]
            return (
              <button
                className="template-card"
                key={template.id}
                onClick={() => onPickTemplate(template.id)}
                style={{ '--template-color': template.color }}
                type="button"
              >
                <span className="template-card-title">{template.title}</span>
                <span className="template-card-hint">{template.hint}</span>
                <img alt="" aria-hidden="true" className={`template-sticker ${sticker.className}`} src={sticker.src} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
