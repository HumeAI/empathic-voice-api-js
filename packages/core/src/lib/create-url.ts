import { Config } from './create-config';

export const createSocketUrl = (config: Config): string => {
  const url = new URL(`wss://${config.hostname}`);

  url.pathname = '/v0/ellm/chat';
  url.searchParams.set('apiKey', config.apiKey);
  url.searchParams.set('channels', config.channels.toString());
  url.searchParams.set('encoding', config.encoding);
  url.searchParams.set('sample_rate', config.sampleRate.toString());
  url.searchParams.set('tts', config.tts.toString());

  return url.href;
};
