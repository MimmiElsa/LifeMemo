import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/fredoka/700.css'
import './styles.css'

const FRAME_WIDTH = 1194
const FRAME_HEIGHT = 834
const FRAME_MARGIN = 24

// Shrink the whole app frame to fit the window (never enlarge past 100%)
function fitFrameToWindow() {
  const scale = Math.min(
    1,
    (window.innerWidth - FRAME_MARGIN * 2) / FRAME_WIDTH,
    (window.innerHeight - FRAME_MARGIN * 2) / FRAME_HEIGHT,
  )
  document.documentElement.style.setProperty('--frame-scale', scale)
}

fitFrameToWindow()
window.addEventListener('resize', fitFrameToWindow)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
