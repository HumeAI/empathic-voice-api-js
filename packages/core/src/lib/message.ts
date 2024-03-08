import {
  SocketFailedToParseMessageError,
  SocketUnknownMessageError,
} from './errors';

import type { AudioMessage } from '@/models/audio-message';
import { parseAudioMessage } from '@/models/audio-message';
import { type JSONMessage, JSONMessageSchema } from '@/models/json-message';
import { unwrapJson } from '@/utils/unwrapJson';

/**
 * @name parseMessageData
 * @description
 * Parse the data of a message from the socket.
 * @param data - The data to parse.
 * @returns
 * The parsed message data.
 * @example
 * ```ts
 * const message = await parseMessageData(data);
 * ```
 */
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

/**
 * @name parseMessageType
 * @description
 * Parse the type of a message from the socket.
 * @param event - The event to parse.
 * @returns
 * The parsed message type.
 * @example
 * ```ts
 * const message = await parseMessageType(event);
 * ```
 */
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
