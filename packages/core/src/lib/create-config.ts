import { z } from 'zod';
import { Channels, AudioEncoding } from './audio';
import { TTSService } from './tts';

const ConfigSchema = z.object({
  apiKey: z.string({
    description: 'API key for the Hume API.',
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

export const createConfig = (config: Partial<Config>): Config => {
  return ConfigSchema.parse({
    apiKey: config?.apiKey,
    hostname: config?.hostname ?? 'api.hume.ai',
    channels: config?.channels ?? Channels.STEREO,
    encoding: config?.encoding ?? AudioEncoding.LINEAR16,
    sampleRate: config?.sampleRate ?? 44100,
    tts: config?.tts ?? TTSService.DEFAULT,
  });
};
