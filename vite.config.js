import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  root: 'rsvp-reader',
  base: '/rapid-serialization-reader/', // Remove /rsvp-reader/ for development when serving the nested app from workspace root
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
