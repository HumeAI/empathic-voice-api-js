/// <reference types="node" />

import {promises} from 'node:fs';
import * as esbuild from 'esbuild';
import type {BuildOptions} from 'esbuild/lib/main';

const commonConfig = {
  bundle: true,
  sourcemap: true,
  minify: true,
  metafile: true,
};

const outdir = 'dist';

async function main() {
  const processorConfig: BuildOptions = {
    entryPoints: [
      'src/lib/AudioWorklet.js',
    ],
    outfile: `${outdir}/audio-worklet-inline.js`,
    ...commonConfig,
  };

  // Generate JS Builds
  console.time('⚡ Build complete! ⚡');

  await esbuild.build(processorConfig);

  let processor: string | undefined;
  try {
    processor = await promises.readFile('./dist/lib/AudioWorklet.js', 'utf8');
  } catch (error: unknown) {
    console.warn(error);
    console.warn('NO PROCESSOR BUILT !');
  }

  // Generate processor file inlined
  const generatedProcessor = ['export default `', processor, '`;'].join('');
  await promises.writeFile('src/lib/generated-processor.ts', generatedProcessor, 'utf8');

  const esbuildEsmConfig: BuildOptions = {
    entryPoints: ['src/index.ts'],
    outfile: `${outdir}/index.esm.js`,
    ...commonConfig,
    platform: 'neutral',
  };

  const esbuildConfig = Object.assign({}, esbuildEsmConfig);
  delete esbuildConfig.platform;
  esbuildConfig.outfile = `${outdir}/index.js`;

  await esbuild.build(esbuildEsmConfig);
  await esbuild.build(esbuildConfig);

  console.timeEnd('⚡ Build complete! ⚡');
}

main().then(() => {
  console.log('Done');
}).catch(error => {
  console.error(error);
});
