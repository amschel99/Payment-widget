import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['bd1c2a2f0b66.ngrok.app', '43ee5d45bd0a.ngrok.app'],
  },
})