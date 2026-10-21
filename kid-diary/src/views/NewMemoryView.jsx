import { useRef } from 'react'

export function NewMemoryView({ model, onAddFile, onRecordPhoto, onRecordVideo, onRecordAudio }) {
  const photoInput = useRef(null)
  const videoInput = useRef(null)
  const audioInput = useRef(null)

  return (
    <section className="memory-page">
      <h1>{model.title}</h1>
      <p>{model.description}</p>
      <div className="memory-actions">
        <button className="memory-action memory-action--add" type="button" disabled={model.busy} onClick={() => photoInput.current?.click()}>
          {model.actions.addPhoto}
        </button>
        <button className="memory-action memory-action--add" type="button" disabled={model.busy} onClick={() => videoInput.current?.click()}>
          {model.actions.addVideo}
        </button>
        <button className="memory-action memory-action--add" type="button" disabled={model.busy} onClick={() => audioInput.current?.click()}>
          {model.actions.addAudio}
        </button>
        <button className="memory-action memory-action--record" type="button" disabled={model.busy} onClick={onRecordPhoto}>
          {model.actions.takePhoto}
        </button>
        <button className="memory-action memory-action--record" type="button" disabled={model.busy && !model.recording} onClick={onRecordVideo}>
          {model.actions.recordVideo}
        </button>
        <button className="memory-action memory-action--record" type="button" disabled={model.busy && !model.recording} onClick={onRecordAudio}>
          {model.actions.recordAudio}
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
      <input
        ref={audioInput}
        accept="audio/*"
        hidden
        type="file"
        onChange={(event) => onAddFile(event.target.files[0], 'audio')}
      />
      {model.status && <p role="status">{model.status}</p>}
    </section>
  )
}