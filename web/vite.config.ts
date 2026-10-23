import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Redirigir TEMP en Windows fuera de AppData\Local\Temp para evitar el bloqueo EPERM ("Acceso denegado") de antivirus
const localTmp = path.resolve(__dirname, 'node_modules/.vite-temp');
try {
  if (!fs.existsSync(localTmp)) fs.mkdirSync(localTmp, { recursive: true });
  process.env.TEMP = localTmp;
  process.env.TMP = localTmp;
} catch {}

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }, // mismo puerto que el dev actual
  build: {
    outDir: 'dist',
    target: 'esnext',
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
