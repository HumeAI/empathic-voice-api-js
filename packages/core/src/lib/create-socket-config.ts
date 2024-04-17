import { z } from 'zod';

import { AuthStrategySchema } from '../models/auth';

export const SocketConfigSchema = z.object({
  // Configs that are set at connection time
  hostname: z.string({
    description: 'Hostname of the Hume API.',
  }),
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

  // Configs that are set as query params
  auth: AuthStrategySchema,
  configId: z
    .string({
      description: 'The ID of the configuration to use.',
    })
    .optional(),
  configVersion: z
    .number({
      description: 'The version of the configuration to use.',
    })
    .optional(),
});

export type SocketConfig = z.infer<typeof SocketConfigSchema>;

/**
 * @name defaultConfig
 * @description
 * The default configuration for the VoiceClient.
 * @type
 * A configuration object.
 */
export const defaultConfig: Omit<SocketConfig, 'auth'> = {
  hostname: 'api.hume.ai',
  reconnectAttempts: 30,
  debug: false,
};

/**
 * @name createSocketConfig
 * @description
 * Create a new configuration for the VoiceClient.
 * @param config - The configuration for the client.
 * @returns
 * A new configuration instance.
 * @example
 * ```ts
 * const config = createSocketConfig({
 *  auth: {
 *   type: 'apiKey',
 *  value: 'test',
 * },
 * });
 * ```
 */
export const createSocketConfig = (
  config: Pick<SocketConfig, 'auth'> & Partial<Omit<SocketConfig, 'auth'>>,
): SocketConfig => {
  if (!config.auth) throw new Error('Auth strategy is required.');

  return SocketConfigSchema.parse({
    ...defaultConfig,
    ...config,
    auth: config.auth,
  });
};
