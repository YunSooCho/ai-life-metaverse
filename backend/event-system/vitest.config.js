import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/__tests__/**/*.js'],
    testTimeout: 10000,
    globals: true
  }
});