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
    port: 4173,
    allowedHosts: [
      '.railway.app',  // Allow all Railway domains
      'localhost'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts', 'papaparse'],
          'xlsx-vendor': ['xlsx'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to suppress warning
  }
})