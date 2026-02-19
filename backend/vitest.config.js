import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      '__tests__/**/*.test.js',
      'tests/**/*.test.js',
      'world-system/__tests__/**/*.test.js'
    ]
  }
})