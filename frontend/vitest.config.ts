/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const viteConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: 'crypto-browserify'
    }
  },
  define: {
    global: 'globalThis'
  }
});

const vitestConfig = defineVitestConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
      ],
      all: true,
    },
    mockReset: true,
    restoreMocks: true,
  },
});

export default mergeConfig(viteConfig, vitestConfig); 