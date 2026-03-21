import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // happy-dom is used instead of jsdom because Vitest 4 bundles jsdom 27
    // whose transitive deps (@csstools/css-calc etc.) are pure ESM and cannot
    // be require()'d by the CJS worker forks that Vitest spins up.
    // happy-dom is fully ESM-native and avoids this incompatibility entirely.
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov', 'json'],
      reportsDirectory: './coverage',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@primus/ui': path.resolve(__dirname, '../shared/src'),
    },
  },
});
