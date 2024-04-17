import { match } from 'ts-pattern';
import { describe, expect, it } from 'vitest';

import { VoiceClient } from './client';
import { defaultConfig } from './create-socket-config';

describe('client', () => {
  it('to start closed', () => {
    const client = VoiceClient.create({
      auth: {
        type: 'apiKey',
        value: 'test',
      },
      ...defaultConfig,
    });

    client.on('message', (message) => {
      match(message.type)
        .with('audio', () => {
          console.log('audio message');
        })
        .with('audio_output', () => {
          console.log('audio json message');
        })
        .with('assistant_message', () => {
          console.log('voice message');
        })
        .with('user_message', () => {
          console.log('user message');
        })
        .with('assistant_end', () => {
          console.log('voice end');
        })
        .with('user_interruption', () => {
          console.log('user interruption');
        })
        .with('error', () => {
          console.log('error');
        })
        .exhaustive();
    });

    expect(client.readyState).toBe(3);
  });
});
