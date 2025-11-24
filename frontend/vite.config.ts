import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  test: {
    environment: 'jsdom',
    css: true,
    env: {
      VITE_GOOGLE_MAPS_API_KEY: "FAKE_KEY_FOR_TESTS",
    },
  },
});