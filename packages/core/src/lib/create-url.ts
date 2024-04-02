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

  url.pathname = '/v0/evi/chat';

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

  if (config.configId) {
    url.searchParams.set('config_id', config.configId.toString());
  }

  if (config.languageModel) {
    url.searchParams.set('language_model', config.languageModel.toString());
  }

  return url.href;
};
