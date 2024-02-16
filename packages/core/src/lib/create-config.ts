import { z } from 'zod';

import { Channels } from './audio';
import { AuthStrategy } from './auth';
import { TTSService } from './tts';

export const ConfigSchema = z.object({
  auth: AuthStrategy,
  hostname: z.string({
    description: 'Hostname of the Hume API.',
  }),
  channels: z
    .nativeEnum(Channels, {
      description: 'Number of channels in the input audio.',
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
    .optional()
    .default(TTSService.DEFAULT),
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

export const defaultConfig: Omit<Config, 'auth'> = {
  hostname: 'api.hume.ai',
  reconnectAttempts: 30,
  debug: false,
  tts: TTSService.DEFAULT,
};

export const createConfig = (
  config: Pick<Config, 'auth'> & Partial<Omit<Config, 'auth'>>,
): Config => {
  if (!config.auth) throw new Error('Auth strategy is required.');

  return ConfigSchema.parse({
    ...defaultConfig,
    ...config,
    auth: config.auth,
  });
};
