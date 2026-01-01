import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/rsvp-reader/', // ⚠️ CHANGE THIS to your GitHub repo name
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'], // Prevent Vite from pre-bundling PDF.js
  },
})
