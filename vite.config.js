import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/Public/Upload': {
        target: 'https://www.hepco.com.vn',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
