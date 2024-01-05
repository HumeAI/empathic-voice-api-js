import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    external: [],
    dts: true,
    sourcemap: true,
  },
]);
