import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        output: {
          entryFile: 'preload.js',
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@renderer': path.resolve(__dirname, './src/renderer'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@components': path.resolve(__dirname, './src/renderer/components'),
      },
    },
    plugins: [react()],
  },
});
