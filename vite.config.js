import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Feastly dev server
export default defineConfig({
  plugins: [react()],
  server: { port: 5175, open: true },
})
