import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: { host: 'localhost', clientPort: Number(globalThis.process?.env.VITE_HMR_CLIENT_PORT || 5173) },
    watch: { usePolling: true, interval: 250 },
  },
})
