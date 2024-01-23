import { z } from 'zod';

import { AudioEncoding, Channels } from './audio';
import { TTSService } from './tts';

export const ConfigSchema = z.object({
  apiKey: z.string({
    description: 'An API key is required for the Hume API.',
  }),
  hostname: z.string({
    description: 'Hostname of the Hume API.',
  }),
  channels: z
    .nativeEnum(Channels, {
      description: 'Number of channels in the input audio.',
    })
    .optional(),
  encoding: z
    .nativeEnum(AudioEncoding, {
      description: 'Encoding type of the input audio.',
    })
    .optional(),
  sampleRate: z
    .number({
      description: 'Sample rate of the input audio.',
    })
    .optional(),
  tts: z
    .nativeEnum(TTSService, {
      description: 'Text-To-Speech service.',
    })
    .optional(),
  reconnectAttempts: z
    .number({
      description: 'Number of times to attempt to reconnect to the API.',
    })
    .optional()
    .default(30),
  debug: z
    .boolean({
      description: 'Enable debug mode.',
    })
    .optional()
    .default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

export const defaultConfig: Omit<Config, 'apiKey'> = {
  hostname: 'api.hume.ai',
  reconnectAttempts: 30,
  debug: false,
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
