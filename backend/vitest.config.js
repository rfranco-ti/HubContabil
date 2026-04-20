import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      },
      include: ['controllers/**/*.js', 'services/**/*.js'],
      exclude: ['tests/**', 'config/**', 'index.js']
    },
    include: ['tests/**/*.test.js'],
    testTimeout: 10000
  }
});
