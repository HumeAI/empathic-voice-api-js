"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)([
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
