import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/users': 'http://localhost:8000',
      '/candidates': 'http://localhost:8000',
      // add other API routes as needed
    }
  }
})