import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Saat development, request /api diteruskan ke backend Express.
    proxy: { '/api': 'http://localhost:3000' },
  },
});
