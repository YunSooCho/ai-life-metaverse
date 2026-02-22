import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['backend/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist']
  }
});