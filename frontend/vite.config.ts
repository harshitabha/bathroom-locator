import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react({
      babel: { plugins: [['babel-plugin-react-compiler']] },
    }),
  ],
  envDir: path.resolve(__dirname, '..'),
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    css: true,
    include: ['src/**/__tests__/**/*.ts?(x)', 'src/**/*.test.ts?(x)'],
  },
});
