import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/yunyao-energy-website/',
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [react()],
});