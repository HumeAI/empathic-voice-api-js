import { match } from 'ts-pattern';
import { describe, expect, it } from 'vitest';

import { AssistantClient } from './client';
import { defaultConfig } from './create-config';

describe('client', () => {
  it('to start closed', () => {
    const client = AssistantClient.create({
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
          console.log('assistant message');
        })
        .with('user_message', () => {
          console.log('user message');
        })
        .with('assistant_end', () => {
          console.log('assistant end');
        })
        .exhaustive();
    });

    expect(client.readyState).toBe(3);
  });
});
