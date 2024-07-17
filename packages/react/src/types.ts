import { z } from 'zod';

export enum TTSService {
  /** Hume's Text-To-Speech */
  DEFAULT = 'hume_ai',
  /** ElevenLab's Text-To-Speech */
  ELEVEN_LABS = 'eleven_labs',
  /** Play HT's Text-To-Speech */
  PLAY_HT = 'play_ht',
}

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

export enum LanguageModelOption {
  CLAUDE_3_OPUS = 'CLAUDE_3_OPUS',
  CLAUDE_3_SONNET = 'CLAUDE_3_SONNET',
  CLAUDE_3_HAIKU = 'CLAUDE_3_HAIKU',
  CLAUDE_21 = 'CLAUDE_21',
  CLAUDE_INSTANT_12 = 'CLAUDE_INSTANT_12',
  GPT_4_TURBO_PREVIEW = 'GPT_4_TURBO_PREVIEW',
  GPT_35_TURBO_0125 = 'GPT_35_TURBO_0125',
  GPT_35_TURBO = 'GPT_35_TURBO',
  FIREWORKS_MIXTRAL_8X7B = 'FIREWORKS_MIXTRAL_8X7B',
}

export const TimeSliceSchema = z.object({
  begin: z.number(),
  end: z.number(),
});

export type TimeSlice = z.infer<typeof TimeSliceSchema>;
