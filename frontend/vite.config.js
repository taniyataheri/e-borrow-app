import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 80,
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      'e-borrow-app-frontend.onrender.com'
    ],
  },
});
