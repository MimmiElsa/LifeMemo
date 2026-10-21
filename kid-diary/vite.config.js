import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from https://mimmielsa.github.io/LifeMemo/
  base: '/LifeMemo/',
  plugins: [react()],
})
