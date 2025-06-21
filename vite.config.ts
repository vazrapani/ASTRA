/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  server: {
    port: 8100,
    strictPort: true,
    host: true,
    proxy: {
      '/api/interpretMultipleCards': {
        target: 'https://asia-northeast3-astrt-e152b.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/interpretMultipleCards/, '/interpretMultipleCards')
      },
      '/api/analyzeQuestion': {
        target: 'https://asia-northeast3-astrt-e152b.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/analyzeQuestion/, '/analyzeQuestion')
      },
      '/api/geminiInterpret': {
        target: 'https://asia-northeast3-astrt-e152b.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geminiInterpret/, '/geminiInterpret')
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'www',
    rollupOptions: {
      input: {
        app: 'index.html'
      }
    }
  }
})
