import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic', include: /\.(jsx|js|tsx|ts)$/ })],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: { host: 'localhost', clientPort: Number(globalThis.process?.env.VITE_HMR_CLIENT_PORT || 5176) },
    watch: { usePolling: true, interval: 250 },
  }
});
