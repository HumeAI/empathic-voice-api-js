import type { Config } from './create-config';
import { TTSService } from './tts';

export const createSocketUrl = (config: Config): string => {
  const url = new URL(`wss://${config.hostname}`);

  url.pathname = '/v0/assistant/chat';
  url.searchParams.set('access_token', config.apiKey);

  const tts = config.tts ? config.tts.toString() : TTSService.DEFAULT;
  url.searchParams.set('tts', tts);

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
