#!/usr/bin/env node
import { generateDocumentation } from 'tsdoc-markdown';

// core library
generateDocumentation({
  inputFiles: ['./packages/core/src/index.ts'],
  outputFile: './docs/core.md',
  buildOptions: {
    explore: true,
    types: true,
  },
});

// react library
generateDocumentation({
  inputFiles: ['./packages/react/src/index.ts'],
  outputFile: './docs/react.md',
  buildOptions: {
    explore: true,
    types: true,
  },
});
