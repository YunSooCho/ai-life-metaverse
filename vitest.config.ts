import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./frontend/src/test-setup.js'],
    include: ['frontend/**/*.test.{js,jsx,ts,tsx}', 'frontend/**/*.spec.{js,jsx,ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'build',
      'frontend/src/i18n/__tests__/**',
      'tests/i18n/**'
    ],
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src')
    }
  },
  // Backend tests configuration (via CLI override)
  projects: [
    {
      test: {
        globals: true,
        environment: 'node',
        include: ['backend/**/*.test.{js,jsx,ts,tsx}'],
        exclude: ['node_modules'],
        name: 'backend-tests'
      }
    }
  ]
});