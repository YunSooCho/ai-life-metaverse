/**
 * Vitest 설정
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      '**/*.test.js',
      '**/__tests__/*.test.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.git/**'
    ]
  }
})