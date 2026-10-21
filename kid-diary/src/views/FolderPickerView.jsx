import { useState } from 'react'
import logo from '../logo.js'
import { NavIcon } from './NavIcon.jsx'

export function FolderPickerView({ model, onSelectFolder, onAddFolder, onBack }) {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAddFolder(trimmed)
    setName('')
    setIsAdding(false)
  }

  return (
    <main className="folder-picker-screen">
      <button className="back-button" onClick={onBack} type="button">
        <NavIcon name="chevron-left" size={18} />
        {model.backLabel}
      </button>
      <div className="logo-header">
        <img className="welcome-logo" src={logo} alt={model.appName} />
      </div>
      <div className="folderpicker-container">
      <h1>{model.title}</h1>
      <p>{model.subtitle}</p>

      <ul className="folder-list">
        {model.folders.map((folder) => (
          <li className="folder-item" key={folder.id}>
            <span className="folder-name">{folder.name}</span>
            <button
              className="folder-tile folder-tile--existing"
              onClick={() => onSelectFolder(folder.id)}
              style={folder.photo ? { backgroundImage: `url(${folder.photo})` } : undefined}
              type="button"
              aria-label={`Open ${folder.name}'s folder`}
            />
          </li>
        ))}

        <li className="folder-item">
          {isAdding ? (
            <form className="folder-tile folder-tile--add folder-add-form" onSubmit={handleSubmit}>
              <label className="folder-add-field">
                <span>{model.nameLabel}</span>
                <input
                  autoFocus
                  maxLength={30}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={model.namePlaceholder}
                  type="text"
                  value={name}
                />
              </label>
              <div className="folder-add-actions">
                <button className="folder-add-save" disabled={!name.trim()} type="submit">
                  {model.saveLabel}
                </button>
                <button className="folder-add-cancel" onClick={() => setIsAdding(false)} type="button">
                  {model.cancelLabel}
                </button>
              </div>
            </form>
          ) : (
            <button
              className="folder-tile folder-tile--add"
              onClick={() => setIsAdding(true)}
              type="button"
            >
              <span className="folder-add-plus">+</span>
              <span className="folder-add-label">{model.addFolderLabel}</span>
              <small className="folder-add-hint">{model.addFolderHint}</small>
            </button>
          )}
        </li>
      </ul>
      </div>
     
    </main>
  )
}
