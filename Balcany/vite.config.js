import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'https://zghimexugkubkyvglqmr.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/functions/v1'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add authorization header to all proxy requests
            proxyReq.setHeader('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaGltZXh1Z2t1Ymt5dmdscW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTM0MTYsImV4cCI6MjA2Nzg2OTQxNn0.-CQPk25p5AZX90uyU5OSoR16EJYNd7piEfs718JIDNk`);
          });
        }
      }
    }
  }
})
