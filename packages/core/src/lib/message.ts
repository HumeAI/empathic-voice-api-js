import z from 'zod';

import type { AudioMessage } from '@/models/audio-message';
import { parseAudioMessage } from '@/models/audio-message';
import { AudioOutputMessageSchema } from '@/models/audio-output-message';
import { TranscriptMessageSchema } from '@/models/transcript-message';
import { VoiceEndMessageSchema } from '@/models/voice-end-message';
import { unwrapJson } from '@/utils/unwrapJson';

export const JSONMessageSchema = z.union([
  AudioOutputMessageSchema,
  TranscriptMessageSchema,
  VoiceEndMessageSchema,
]);

export type JSONMessage = z.infer<typeof JSONMessageSchema>;

export const parseMessageData = async (
  data: unknown,
): Promise<
  | {
      success: true;
      message: JSONMessage | AudioMessage;
    }
  | {
      success: false;
      error: Error;
    }
> => {
  if (data instanceof Blob) {
    const message = await parseAudioMessage(data);

    if (message) {
      return {
        success: true,
        message,
      };
    } else {
      return {
        success: false,
        error: new Error('Failed to parse blob as audio message.'),
      };
    }
  }

  if (typeof data !== 'string') {
    return {
      success: false,
      error: new Error('Failed to parse message from socket'),
    };
  }

  const obj = unwrapJson(data, JSONMessageSchema);

  if (obj === null) {
    return {
      success: false,
      error: new Error('Failed to parse message from socket'),
    };
  }

  return {
    success: true,
    message: obj,
  };
};

export const parseMessageType = async (
  event: MessageEvent,
): Promise<
  | {
      success: true;
      message: JSONMessage | AudioMessage;
    }
  | {
      success: false;
      error: Error;
    }
> => {
  const data: unknown = event.data;
  return parseMessageData(data);
};
