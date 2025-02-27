import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '3333-2409-40d4-311d-3ff8-45bd-40a1-ed5f-36da.ngrok-free.app', // Add your ngrok host here
      "e4ba-103-255-103-3.ngrok-free.app"
    ],
  },
})
