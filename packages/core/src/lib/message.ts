import z from 'zod';

import {
  SocketFailedToParseMessageError,
  SocketUnknownMessageError,
} from './errors';

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
        error: new SocketFailedToParseMessageError(
          `Received blob was unable to be converted to ArrayBuffer.`,
        ),
      };
    }
  }

  if (typeof data !== 'string') {
    return {
      success: false,
      error: new SocketFailedToParseMessageError(
        `Expected a string but received ${typeof data}.`,
      ),
    };
  }

  const obj = unwrapJson(data, JSONMessageSchema);

  if (obj === null) {
    return {
      success: false,
      error: new SocketUnknownMessageError(
        `Received JSON was not a known message type.`,
      ),
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
