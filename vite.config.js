import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'vendor-leaflet'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) return 'vendor-react'
            return 'vendor'
          }
        }
      }
    }
  }
})
