import blueSmile from '../../assets/stickers/blue-smile@3x 1.png'
import pinkWink from '../../assets/stickers/pink-wink@3x 1.png'

// The stickers that can be stuck on a page. An entry saves only the id of a sticker
// (see createSticker in models.js), and this catalog turns the id into a picture.
const drawings = {
  star: (
    <path
      d="M32 5l7.4 15.2 16.6 2-12.2 11.5 3.1 16.5L32 42.2 17.1 50.2l3.1-16.5L8 22.2l16.6-2z"
      fill="#FFC93C"
      stroke="#FFFFFF"
      strokeLinejoin="round"
      strokeWidth="4"
    />
  ),
  heart: (
    <path
      d="M32 56S8 41 8 24a13 13 0 0 1 24-6.5A13 13 0 0 1 56 24c0 17-24 32-24 32z"
      fill="#FF6B8B"
      stroke="#FFFFFF"
      strokeLinejoin="round"
      strokeWidth="4"
    />
  ),
  sun: (
    <>
      <g stroke="#FFB020" strokeLinecap="round" strokeWidth="5">
        <path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M12 52l6-6M46 18l6-6" />
      </g>
      <circle cx="32" cy="32" fill="#FFD84D" r="14" stroke="#FFFFFF" strokeWidth="3" />
    </>
  ),
  flower: (
    <>
      <g fill="#FF9FCB" stroke="#FFFFFF" strokeWidth="2.5">
        <circle cx="32" cy="14" r="10" />
        <circle cx="50" cy="28" r="10" />
        <circle cx="43" cy="49" r="10" />
        <circle cx="21" cy="49" r="10" />
        <circle cx="14" cy="28" r="10" />
      </g>
      <circle cx="32" cy="34" fill="#FFD84D" r="9" stroke="#FFFFFF" strokeWidth="2.5" />
    </>
  ),
  cloud: (
    <path
      d="M18 46a12 12 0 0 1-1-24 15 15 0 0 1 29 3 10 10 0 0 1 0 21z"
      fill="#CFE6FF"
      stroke="#FFFFFF"
      strokeLinejoin="round"
      strokeWidth="4"
    />
  ),
  rainbow: (
    <g fill="none" strokeLinecap="round" strokeWidth="6">
      <path d="M8 48a24 24 0 0 1 48 0" stroke="#FF6B6B" />
      <path d="M16 48a16 16 0 0 1 32 0" stroke="#FFD84D" />
      <path d="M24 48a8 8 0 0 1 16 0" stroke="#6BC7FF" />
    </g>
  ),
  smiley: (
    <>
      <circle cx="32" cy="32" fill="#FFD84D" r="26" stroke="#FFFFFF" strokeWidth="4" />
      <circle cx="23" cy="26" fill="#141A26" r="3.5" />
      <circle cx="41" cy="26" fill="#141A26" r="3.5" />
      <path d="M20 38a14 12 0 0 0 24 0" fill="none" stroke="#141A26" strokeLinecap="round" strokeWidth="4" />
    </>
  ),
  balloon: (
    <>
      <ellipse cx="32" cy="24" fill="#FF6B6B" rx="16" ry="19" stroke="#FFFFFF" strokeWidth="3.5" />
      <path d="M32 43l-4 5h8z" fill="#FF6B6B" />
      <path d="M32 48c-4 4 4 7 0 12" fill="none" stroke="#8A7F6A" strokeLinecap="round" strokeWidth="2.5" />
    </>
  ),
}

const pictures = { 'blue-smile': blueSmile, 'pink-wink': pinkWink }

// The picture of a sticker, at the given size in pixels
export function StickerArt({ id, size = 72 }) {
  if (pictures[id]) {
    return <img alt="" aria-hidden="true" draggable="false" height={size} src={pictures[id]} width={size} />
  }
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 64 64" width={size}>
      {drawings[id]}
    </svg>
  )
}
