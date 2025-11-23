import {defineConfig} from 'vite';

export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' for browser-like environments
  },
});
