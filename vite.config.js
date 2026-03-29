import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/tenant_auth': {
        target: 'https://multi-tenant-backend-q9ja.onrender.com',
        changeOrigin: true,
      },
      '/workflows': {
        target: 'https://multi-tenant-backend-q9ja.onrender.com',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
