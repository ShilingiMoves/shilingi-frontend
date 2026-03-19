import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.PNG'],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'https://shilingibackend-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
