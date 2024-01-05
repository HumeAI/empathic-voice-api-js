export type AudioMessage = {
  type: 'audio';
  data: ArrayBuffer;
};

export type TranscriptMessage = {
  type: 'transcript';
  data: {
    sender: string;
    content: string;
  };
};

export type Message = AudioMessage | TranscriptMessage;

export const parseAudioMessage = async (
  blob: Blob,
): Promise<AudioMessage | null> => {
  return blob
    .arrayBuffer()
    .then((buffer) => {
      return {
        type: 'audio',
        data: buffer,
      } as const;
    })
    .catch(() => {
      return null;
    });
};

export const parseMessageType = async (
  event: MessageEvent,
): Promise<
  | {
      success: true;
      message: Message;
    }
  | {
      success: false;
      error: Error;
    }
> => {
  const data: unknown = event.data;

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

  return {
    success: false,
    error: new Error('Unknown message type.'),
  };
};
