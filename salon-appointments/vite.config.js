import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ये line जरूर होनी चाहिए

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // पूरा absolute path
      }
    }
  }
});