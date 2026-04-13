import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vite-local',
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['drop4crop']
  }
})