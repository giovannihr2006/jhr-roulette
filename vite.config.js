import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@logic': path.resolve(__dirname, './src/logic')
    }
  },
  server: {
    port: 7777,
    strictPort: true,
    open: 'chrome',
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-i18n': ['i18next', 'react-i18next']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/release/**',
      '**/preview_*/**',
      '**/_backups/**',
      '**/backups/**',
      '**/temp_archive/**',
      '**/reference/**'
    ]
  }
})
