import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: './',
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'tests/**/*.{test,spec}.{js,jsx,mjs,cjs,ts,mts,cts}',
      'frontend/src/**/*.{test,spec}.{js,jsx,mjs,cjs,ts,mts,cts}',
      'shared/**/*.{test,spec}.{js,jsx,mjs,cjs,ts,mts,cts}',
      'backend/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'backend/pet-system/*.test.js'
    ],
    setupFiles: [resolve(__dirname, 'frontend/src/__tests__/setup.js')],
    coverage: {
      provider: 'v8'
    }
  }
})