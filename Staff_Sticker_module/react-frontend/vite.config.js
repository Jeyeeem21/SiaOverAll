import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 250,
    },
    hmr: { host: 'localhost', clientPort: Number(globalThis.process?.env.VITE_HMR_CLIENT_PORT || 5176) },
  },
});
