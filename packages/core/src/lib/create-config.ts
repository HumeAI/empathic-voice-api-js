import { z } from 'zod';

import { Channels } from './audio';
import { AuthStrategySchema } from './auth';
import { TTSService } from './tts';

/**
 * @name MAX_SYSTEM_PROMPT_LENGTH
 * @description
 * The maximum length of the system prompt.
 * @type
 * A number.
 * @default
 * 1900
 * @see
 * - [Stack Overflow](https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers)
 */
export const MAX_SYSTEM_PROMPT_LENGTH = 1900;

export const ConfigSchema = z.object({
  auth: AuthStrategySchema,
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

/**
 * @name defaultConfig
 * @description
 * The default configuration for the VoiceClient.
 * @type
 * A configuration object.
 */
export const defaultConfig: Omit<Config, 'auth'> = {
  hostname: 'api.hume.ai',
  reconnectAttempts: 30,
  debug: false,
  tts: TTSService.DEFAULT,
};

/**
 * @name createConfig
 * @description
 * Create a new configuration for the VoiceClient.
 * @param config - The configuration for the client.
 * @returns
 * A new configuration instance.
 * @example
 * ```ts
 * const config = createConfig({
 *  auth: {
 *   type: 'apiKey',
 *  value: 'test',
 * },
 * });
 * ```
 */
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
