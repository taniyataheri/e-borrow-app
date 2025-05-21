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
      '4139-2001-fb1-11e-8ab5-dd5a-ae6e-172-f71a.ngrok-free.app'
    ],
  },
});
