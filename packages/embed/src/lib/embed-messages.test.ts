import { describe, expect, it } from 'vitest';

import {
  parseClientToFrameAction,
  UPDATE_CONFIG_ACTION,
} from './embed-messages';

export enum TTSService {
  /** Hume's Text-To-Speech */
  DEFAULT = 'hume_ai',
  /** ElevenLab's Text-To-Speech */
  ELEVEN_LABS = 'eleven_labs',
  /** Play HT's Text-To-Speech */
  PLAY_HT = 'play_ht',
}

describe('parseEmbedMessage', () => {
  it('should parse embed message', async () => {
    const test = () => {
      const action = UPDATE_CONFIG_ACTION({
        apiKey: '',
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
