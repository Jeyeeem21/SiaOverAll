import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: { host: 'localhost', clientPort: Number(globalThis.process?.env.VITE_HMR_CLIENT_PORT || 5177) },
    watch: { usePolling: true, interval: 250 },
    open: false,
    strictPort: true, // Never fallback to other ports — fail instead
  },
  css: {
    postcss: './postcss.config.js',
  },
  define: {
    // Fix React Fast Refresh issues
    __DEV__: true,
  },
  // Improve dev experience
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
