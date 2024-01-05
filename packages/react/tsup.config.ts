import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    external: ['react'],
    banner: {
      js: `'use client';`,
    },
    dts: true,
    sourcemap: true,
  },
]);
