import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [react(), cloudflare()],
});