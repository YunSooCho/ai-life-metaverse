import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    include: [
      '__tests__/**/*.test.js',
      'tests/**/*.test.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'cypress/**',
      '.{idea,git,cache,output,temp}/**',
      '{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
    ]
  }
})