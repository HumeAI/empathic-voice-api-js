import { TTSService } from '@humeai/voice';
import { describe, expect, it } from 'vitest';

import {
  parseClientToFrameAction,
  UPDATE_CONFIG_ACTION,
} from './embed-messages';

describe('parseEmbedMessage', () => {
  it('should parse embed message', async () => {
    const test = () => {
      const action = UPDATE_CONFIG_ACTION({
        auth: {
          type: 'apiKey',
          value: '',
        },
        hostname: '',
        reconnectAttempts: 0,
        debug: false,
        tts: TTSService.DEFAULT,
      });
      return parseClientToFrameAction(action);
    };
    expect(test).not.toThrowError();
    expect(await test()).toMatchObject({
      type: 'update_config',
    });
  });

  it('should reject on invalid embed message', async () => {
    const test = () => {
      return parseClientToFrameAction({
        type: 'invalid',
      });
    };
    await expect(test).rejects.toBeInstanceOf(Error);
  });
});
