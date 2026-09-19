import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  server: {
    https: {
      cert: fs.readFileSync('./localhost+2.pem'),
      key: fs.readFileSync('./localhost+2-key.pem'),
    },

    cors: {
      origin: 'https://supervisor.ext-twitch.tv',
    },

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})