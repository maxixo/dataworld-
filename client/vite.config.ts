import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'chart-vendor': ['recharts', 'papaparse'],
          'xlsx-vendor': ['xlsx'],
          'animation-vendor': ['framer-motion'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          'export-vendor': ['html2canvas', 'jspdf'],
          'utility-vendor': ['axios', 'react-icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  }
})
