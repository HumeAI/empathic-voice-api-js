import { z } from 'zod';

import { AudioEncoding, Channels } from './audio';
import { TTSService } from './tts';

const ConfigSchema = z.object({
  apiKey: z.string({
    description: 'An API key is required for the Hume API.',
  }),
  hostname: z.string({
    description: 'Hostname of the Hume API.',
  }),
  channels: z.nativeEnum(Channels, {
    description: 'Number of channels in the input audio.',
  }),
  encoding: z.nativeEnum(AudioEncoding, {
    description: 'Encoding type of the input audio.',
  }),
  sampleRate: z.number({
    description: 'Sample rate of the input audio.',
  }),
  tts: z.nativeEnum(TTSService, {
    description: 'Text-To-Speech service.',
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export const createConfig = (
  config: Pick<Config, 'apiKey'> & Partial<Omit<Config, 'apiKey'>>,
): Config => {
  return ConfigSchema.parse({
    apiKey: config.apiKey,
    hostname: config?.hostname ?? 'api.hume.ai',
    channels: config?.channels ?? Channels.STEREO,
    encoding: config?.encoding ?? AudioEncoding.LINEAR16,
    sampleRate: config?.sampleRate ?? 44100,
    tts: config?.tts ?? TTSService.DEFAULT,
  });
};
