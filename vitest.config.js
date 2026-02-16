import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['frontend/src/**/__tests__/**/*.{test,spec}.{js,jsx,mjs,cjs,ts,mts,cts}'],
    setupFiles: [],
  }
})