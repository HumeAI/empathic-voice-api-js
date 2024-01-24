import z from 'zod';

export const AudioMessageSchema = z.object({
  type: z.literal('audio'),
  data: z.instanceof(ArrayBuffer),
});

export type AudioMessage = z.infer<typeof AudioMessageSchema>;

export const TranscriptMessageSchema = z.object({
  type: z.literal('transcript'),
  data: z.object({
    sender: z.string(),
    content: z.string(),
  }),
});

export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;

export const MessageSchema = z.union([
  AudioMessageSchema,
  TranscriptMessageSchema,
]);

export const parseAudioMessage = async (
  blob: Blob,
): Promise<AudioMessage | null> => {
  return blob
    .arrayBuffer()
    .then((buffer) => {
      return {
        type: 'audio' as const,
        data: buffer,
      };
    })
    .catch(() => {
      return null;
    });
};

export type Message = z.infer<typeof MessageSchema>;

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
