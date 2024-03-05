import { z } from 'zod';

import { Channels } from './audio';
import { AuthStrategy } from './auth';
import { TTSService } from './tts';

// https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
export const MAX_SYSTEM_PROMPT_LENGTH = 1900;

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
  speedRatio: z
    .number({
      description: 'Speed ratio of the TTS service.',
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
  systemPrompt: z
    .string({
      description: 'System prompt to use for the Voice.',
    })
    .max(MAX_SYSTEM_PROMPT_LENGTH)
    .optional(),
  no_binary: z
    .boolean({
      description: 'Audio output format for Voice responses.',
    })
    .optional(),
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
