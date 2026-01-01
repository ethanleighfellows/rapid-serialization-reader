import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/', // Remove /rsvp-reader/ for development
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    host: true, // Listen on all addresses for Codespaces
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
