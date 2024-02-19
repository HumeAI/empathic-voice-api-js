import type { Config } from './create-config';

export const createSocketUrl = (config: Config): string => {
  const url = new URL(`wss://${config.hostname}`);

  url.pathname = '/v0/assistant/chat';

  // receive audio responses as json with IDs instead of binary messages
  url.searchParams.set('no_binary', String(true));

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

  if (config.sampleRate) {
    url.searchParams.set('sample_rate', config.sampleRate.toString());
  }

  if (config.tts) {
    url.searchParams.set('tts', config.tts.toString());
  }

  if (config.systemPrompt) {
    url.searchParams.set('system_prompt', config.systemPrompt);
  }

  return url.href;
};
