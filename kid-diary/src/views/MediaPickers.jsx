import { useRef, useState } from 'react'
import { NavIcon } from './NavIcon.jsx'

// How a chosen file is shown: its name, or a name for something just recorded
function describe(value, labels) {
  if (value.name) return value.name
  if (value.type?.startsWith('video/')) return labels.cameraVideo
  if (value.type?.startsWith('audio/')) return labels.recording
  return labels.cameraPhoto
}

// The small row of buttons for adding media: choose a file, or use the camera or microphone.
//   accept:   what the file chooser allows ('image/*,video/*' or 'audio/*')
//   actions:  [{ id, label, icon, record }] extra buttons; `record` is a function that gives back a
//             file (a photo) or, when it takes { onStart }, records until the stop callback is called
//   recorder: the camera and microphone functions: { takePhoto, recordVideo, recordAudio }
function MediaPicker({ accept, chooseLabel, labels, onChange, recorder, actions, value }) {
  const [recordingId, setRecordingId] = useState(null)
  const [error, setError] = useState('')
  const stopRef = useRef(null)

  async function runAction(action) {
    setError('')
    // pressing the same button again stops a recording that is going
    if (recordingId === action.id) {
      stopRef.current?.()
      return
    }
    try {
      if (action.recording) {
        setRecordingId(action.id)
        const file = await recorder[action.recorder]({ onStart: (stop) => (stopRef.current = stop) })
        onChange(file)
      } else {
        onChange(await recorder[action.recorder]())
      }
    } catch (caught) {
      setError(caught.message)
    } finally {
      stopRef.current = null
      setRecordingId(null)
    }
  }

  if (value) {
    return (
      <div className="answer-photo-chosen">
        <span>{describe(value, labels)}</span>
        <button className="answer-link" onClick={() => onChange(null)} type="button">
          {labels.remove}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="answer-photo-choices">
        <label className="answer-pill">
          <NavIcon name={accept.startsWith('audio') ? 'mic' : 'camera'} size={16} />
          {chooseLabel}
          <input
            accept={accept}
            hidden
            onChange={(event) => onChange(event.target.files[0] ?? null)}
            type="file"
          />
        </label>
        {actions.map((action) => (
          <button
            className={`answer-pill${recordingId === action.id ? ' answer-pill--recording' : ''}`}
            key={action.id}
            onClick={() => runAction(action)}
            type="button"
          >
            <NavIcon name={action.icon} size={16} />
            {recordingId === action.id ? labels.stopRecording : action.label}
          </button>
        ))}
      </div>
      {error && <span className="answer-error">{error}</span>}
    </>
  )
}

// A photo or video: choose a file, take a photo, or record a video
export function PhotoPicker({ labels, onChange, recorder, value }) {
  return (
    <MediaPicker
      accept="image/*,video/*"
      actions={[
        { id: 'photo', label: labels.takePhoto, icon: 'camera', recorder: 'takePhoto' },
        { id: 'video', label: labels.recordVideo, icon: 'camera', recorder: 'recordVideo', recording: true },
      ]}
      chooseLabel={labels.choosePhoto}
      labels={labels}
      onChange={onChange}
      recorder={recorder}
      value={value}
    />
  )
}

// An audio recording: choose a file, or record with the microphone
export function AudioPicker({ labels, onChange, recorder, value }) {
  return (
    <MediaPicker
      accept="audio/*"
      actions={[{ id: 'audio', label: labels.recordAudio, icon: 'mic', recorder: 'recordAudio', recording: true }]}
      chooseLabel={labels.chooseAudio}
      labels={labels}
      onChange={onChange}
      recorder={recorder}
      value={value}
    />
  )
}
