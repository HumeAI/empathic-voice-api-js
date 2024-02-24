import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function getPort(): number {
  let port = 3000;
  if (process.env.PORT) {
    const maybePort = parseInt(process.env.PORT, 10);
    port = isNaN(maybePort) ? port : maybePort;
  }
  return port;
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  plugins: [react()],

  server: {
    port: getPort(),
  },
});
