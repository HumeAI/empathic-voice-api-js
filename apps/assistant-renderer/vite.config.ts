import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [react()],

  server: {
    port: getPort(),
  },
});
