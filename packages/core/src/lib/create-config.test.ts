import { describe, expect, it } from 'vitest';
import { Channels, AudioEncoding, createConfig, TTSService } from '..';

describe('create-config', () => {
  it('creates a new config object with defaults', () => {
    const config = createConfig({
      apiKey: 'hume-api-key-1234',
    });

    expect(config).toMatchObject({
      apiKey: 'hume-api-key-1234',
      channels: Channels.STEREO,
      encoding: AudioEncoding.LINEAR16,
      hostname: 'api.hume.ai',
      sampleRate: 44100,
      tts: TTSService.DEFAULT,
    });
  });

  it('throws an error if the API key is missing', () => {
    expect(() => {
      // @ts-expect-error - testing invalid input
      createConfig({});
    }).toThrow();
  });
});
