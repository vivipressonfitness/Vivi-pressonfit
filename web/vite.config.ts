import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }, // mismo puerto que el dev actual
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Separación de chunks pesados para cache eficiente en Vercel
        manualChunks: {
          hls: ['hls.js'],
          supabase: ['@supabase/supabase-js'],
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
        },
      },
    },
  },
});
