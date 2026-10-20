import { useRef } from 'react'

export function NewMemoryView({ model, onAddFile, onRecordPhoto, onRecordVideo }) {
  const photoInput = useRef(null)
  const videoInput = useRef(null)

  return (
    <section className="memory-page">
      <h1>{model.title}</h1>
      <p>{model.description}</p>
      <div className="memory-actions">
        <button type="button" disabled={model.busy} onClick={() => photoInput.current?.click()}>
          {model.actions.addPhoto}
        </button>
        <button type="button" disabled={model.busy} onClick={() => videoInput.current?.click()}>
          {model.actions.addVideo}
        </button>
        <button type="button" disabled={model.busy} onClick={onRecordPhoto}>
          {model.actions.takePhoto}
        </button>
        <button type="button" disabled={model.busy && !model.recording} onClick={onRecordVideo}>
          {model.actions.recordVideo}
        </button>
      </div>
      <input
        ref={photoInput}
        accept="image/*"
        hidden
        type="file"
        onChange={(event) => onAddFile(event.target.files[0], 'photo')}
      />
      <input
        ref={videoInput}
        accept="video/*"
        hidden
        type="file"
        onChange={(event) => onAddFile(event.target.files[0], 'video')}
      />
      {model.status && <p role="status">{model.status}</p>}
    </section>
  )
}