import type { SocketConfig } from '@/lib/create-socket-config';

/**
 * @name createSocketUrl
 * @description
 * Create a new socket URL for the VoiceClient.
 * @param config - The configuration for the client.
 * @returns
 * A new socket URL.
 * @example
 * ```ts
 * const url = createSocketUrl(config);
 * ```
 */
export const createSocketUrl = (config: SocketConfig): string => {
  const url = new URL(`wss://${config.hostname}`);

  url.pathname = '/v0/evi/chat';

  if (config.auth.type === 'accessToken') {
    url.searchParams.set('accessToken', config.auth.value);
  } else if (config.auth.type === 'apiKey') {
    url.searchParams.set('apiKey', config.auth.value);
  }

  if (config.configId) {
    url.searchParams.set('config_id', config.configId);
  }

  if (config.configVersion) {
    url.searchParams.set('config_version', String(config.configVersion));
  }

  return url.href;
};
