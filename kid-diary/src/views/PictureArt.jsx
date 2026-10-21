// A picture option: its illustration, or the placeholder emoji until the illustration is added
export function PictureArt({ option, size = 'small' }) {
  if (option.image) return <img alt="" className={`picture-art picture-art--${size}`} src={option.image} />

  return (
    <span aria-hidden="true" className={`picture-art picture-art--${size}`}>
      {option.emoji}
    </span>
  )
}
