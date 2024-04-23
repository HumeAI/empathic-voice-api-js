import z from 'zod';

export enum Channels {
  /** Mono */
  MONO = 1,
  /** Stereo */
  STEREO = 2,
}

export enum AudioEncoding {
  /** 16-bit signed little-endian (PCM) */
  LINEAR16 = 'linear16',
  /** Ogg Opus */
  OPUS = 'opus',
}

const AudioConfigurationSchema = z.object({
  channels: z.nativeEnum(Channels, {
    description: 'Number of channels in the input audio.',
  }),
  encoding: z.nativeEnum(AudioEncoding, {
    description: 'Encoding of the input audio.',
  }),
  sampleRate: z.number({
    description: 'Sample rate of the input audio.',
  }),
});

const ContextConfigurationSchema = z.object({
  text: z.string(),
  type: z.enum(['editable', 'persistent', 'temporary']).optional(),
});

export const SessionSettingsSchema = z.object({
  audio: AudioConfigurationSchema.optional(),
  context: ContextConfigurationSchema.optional(),
  languageModelApiKey: z.string().optional(),
  customSessionId: z.string().optional(),
  systemPrompt: z.string().optional(),
});

export type SessionSettings = z.infer<typeof SessionSettingsSchema>;
