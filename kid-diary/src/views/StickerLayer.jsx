import { useRef, useState } from 'react'
import { NavIcon } from './NavIcon.jsx'
import { StickerArt } from './stickerCatalog.jsx'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// The stickers stuck on the open book. The layer covers both facing pages, and a sticker's place
// is saved in percent of that area. While the page is being edited a sticker can be dragged
// to a new place or taken off.
export function StickerLayer({ editing, onMove, onRemove, removeLabel, stickers }) {
  const layerRef = useRef(null)
  // the sticker being dragged and where it is right now (saved when it is let go)
  const [drag, setDrag] = useState(null)

  function pointToPercent(event) {
    const rect = layerRef.current.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 3, 97),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 3, 97),
    }
  }

  function handlePointerDown(event, sticker) {
    if (!editing) return
    try {
      // keeps the drag going when the pointer slips off the sticker
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // the drag still works without it
    }
    setDrag({ id: sticker.id, ...pointToPercent(event) })
  }

  function handlePointerMove(event, sticker) {
    if (drag?.id === sticker.id) setDrag({ id: sticker.id, ...pointToPercent(event) })
  }

  function handlePointerUp(event, sticker) {
    if (drag?.id !== sticker.id) return
    const place = pointToPercent(event)
    setDrag(null)
    onMove(sticker.id, place.x, place.y)
  }

  return (
    <div className="sticker-layer" ref={layerRef}>
      {stickers.map((sticker) => {
        const place = drag?.id === sticker.id ? drag : sticker
        return (
          <div
            className={`page-sticker${editing ? ' page-sticker--editing' : ''}${drag?.id === sticker.id ? ' is-dragging' : ''}`}
            key={sticker.id}
            onPointerDown={(event) => handlePointerDown(event, sticker)}
            onPointerMove={(event) => handlePointerMove(event, sticker)}
            onPointerUp={(event) => handlePointerUp(event, sticker)}
            style={{
              left: `${place.x}%`,
              top: `${place.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
            }}
          >
            <StickerArt id={sticker.sticker} size={76} />
            {editing && (
              <button
                aria-label={removeLabel}
                className="page-sticker-remove"
                onClick={() => onRemove(sticker.id)}
                onPointerDown={(event) => event.stopPropagation()}
                type="button"
              >
                <NavIcon name="close" size={12} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
