import type { Config } from './create-config';

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
export const createSocketUrl = (config: Config): string => {
  const url = new URL(`wss://${config.hostname}`);

  url.pathname = '/v0/assistant/chat';

  // receive audio responses as json with IDs instead of binary messages
  url.searchParams.set('no_binary', String(true));

  if (config.auth.type === 'accessToken') {
    url.searchParams.set('accessToken', config.auth.value);
  } else if (config.auth.type === 'apiKey') {
    url.searchParams.set('apiKey', config.auth.value);
  }

  if (config.tts) {
    url.searchParams.set('tts', config.tts.toString());
  }

  if (config.channels) {
    url.searchParams.set('channels', config.channels.toString());
  }

  if (config.sampleRate) {
    url.searchParams.set('sample_rate', config.sampleRate.toString());
  }

  if (config.speedRatio) {
    url.searchParams.set('speed_ratio', config.speedRatio.toString());
  }

  return url.href;
};
