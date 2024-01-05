import { z } from 'zod';

import { AudioEncoding, Channels } from './audio';
import { TTSService } from './tts';

const ConfigSchema = z.object({
  apiKey: z.string({
    description: 'An API key is required for the Hume API.',
  }),
  hostname: z.string({
    description: 'Hostname of the Hume API.',
  }),
  channels: z.nativeEnum(Channels, {
    description: 'Number of channels in the input audio.',
  }),
  encoding: z.nativeEnum(AudioEncoding, {
    description: 'Encoding type of the input audio.',
  }),
  sampleRate: z.number({
    description: 'Sample rate of the input audio.',
  }),
  tts: z.nativeEnum(TTSService, {
    description: 'Text-To-Speech service.',
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export const defaultConfig: Omit<Config, 'apiKey'> = {
  hostname: 'api.hume.ai',
  channels: Channels.STEREO,
  encoding: AudioEncoding.LINEAR16,
  sampleRate: 44100,
  tts: TTSService.DEFAULT,
};

export const createConfig = (
  config: Pick<Config, 'apiKey'> & Partial<Omit<Config, 'apiKey'>>,
): Config => {
  if (!config.apiKey) throw new Error('API key is required.');

  return ConfigSchema.parse({
    ...defaultConfig,
    ...config,
    apiKey: config.apiKey,
  });
};
