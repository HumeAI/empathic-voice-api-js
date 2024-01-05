import { describe, expect, test } from 'vitest';
import { Channels, AudioEncoding, createConfig, TTSService } from '..';

describe('create-config', () => {
  test('', () => {
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
});
