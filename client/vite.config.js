import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite que otros dispositivos en la misma red local (LAN/Wi-Fi) se conecten
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});
