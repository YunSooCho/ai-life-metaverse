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
      '**/__tests__/*.test.js',
      'ai/__tests__/*.test.js',
      '__tests__/*.test.js',
      'world-system/__tests__/*.test.js',
      'friend-system/__tests__/*.test.js',
      'crafting-system/__tests__/*.test.js',
      'guild-system/__tests__/*.test.js',
      'raid-system/__tests__/*.test.js',
      'pet-system/__tests__/*.test.js',
      'trade-system/__tests__/*.test.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.git/**'
    ]
  }
})