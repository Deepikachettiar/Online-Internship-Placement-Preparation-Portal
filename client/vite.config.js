import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Pages call the API with relative URLs like /api/...; send them to the Express server.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
