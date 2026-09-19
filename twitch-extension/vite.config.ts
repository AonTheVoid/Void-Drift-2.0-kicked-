import fs from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',

  plugins: [react()],

  build: {
  rollupOptions: {
    input: {
      index: resolve(__dirname, 'index.html'),
      config: resolve(__dirname, 'config.html'),
    },

    output: {
      entryFileNames: '[name]-[hash].js',
      chunkFileNames: '[name]-[hash].js',
      assetFileNames: '[name]-[hash][extname]',
    },
  },
},

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