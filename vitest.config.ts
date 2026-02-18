import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './frontend/src/test-setup.js',
    include: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    exclude: [
      'node_modules', 
      'dist', 
      '.next', 
      'build',
      'frontend/src/i18n/__tests__/**',  // i18n 테스트는 mock 제외
      'tests/i18n/**'  // i18n 테스트는 mock 제외
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src')
    }
  }
});