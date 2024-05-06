import { match } from 'ts-pattern';
import { describe, expect, it, vi } from 'vitest';

import { VoiceClient } from './client';
import { defaultConfig } from './create-socket-config';

import { flushPromises } from '@/test-utils/flushPromises';

vi.mock('./message', () => {
  return {
    parseMessageType: vi.fn().mockResolvedValue({ success: false }),
  };
});

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
        .with('tool_call', () => {
          console.log('tool call');
        })
        .with('tool_response', () => {
          console.log('tool response');
        })
        .with('tool_error', () => {
          console.log('tool error');
        })
        .exhaustive();
    });

    expect(client.readyState).toBe(3);
  });

  it('should not call the message event handler if parseMessageType returns a failure', async () => {
    const client = VoiceClient.create({
      ...defaultConfig,
      auth: {
        type: 'apiKey',
        value: 'test',
      },
    });

    const messageHandler = vi.fn();
    client.on('message', messageHandler);

    const testEvent = new MessageEvent('message', {
      data: JSON.stringify({ type: 'test_message', payload: 'test' }),
    });
    client.handleMessage(testEvent);

    await flushPromises();
    expect(messageHandler).not.toHaveBeenCalled();
  });
});
