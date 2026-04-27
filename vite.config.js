import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [react(), cesium()],
  cacheDir: 'node_modules/.vite-local',
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['drop4crop']
  }
})