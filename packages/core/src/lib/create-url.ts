import type { Config } from './create-config';

export const createSocketUrl = (config: Config): string => {
  const url = new URL(`wss://${config.hostname}`);

  url.pathname = '/v0/assistant/chat';

  if (config.auth.type === 'access_token') {
    url.searchParams.set('access_token', config.auth.value);
  } else if (config.auth.type === 'apiKey') {
    url.searchParams.set('apiKey', config.auth.value);
  }

  if (config.tts) {
    url.searchParams.set('tts', config.tts.toString());
  }

  if (config.channels) {
    url.searchParams.set('channels', config.channels.toString());
  }

  if (config.encoding) {
    url.searchParams.set('encoding', config.encoding);
  }

  if (config.sampleRate) {
    url.searchParams.set('sample_rate', config.sampleRate.toString());
  }

  if (config.tts) {
    url.searchParams.set('tts', config.tts.toString());
  }

  return url.href;
};
