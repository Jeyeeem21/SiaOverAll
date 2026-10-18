import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost',
    hmr: false,
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
