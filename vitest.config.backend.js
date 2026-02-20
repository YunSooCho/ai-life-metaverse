import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'backend/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'backend/database/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ]
  }
})