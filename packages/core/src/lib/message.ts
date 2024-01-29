import z from 'zod';

export const AudioMessageSchema = z.object({
  type: z.literal('audio'),
  data: z.instanceof(ArrayBuffer),
});

export type AudioMessage = z.infer<typeof AudioMessageSchema>;

export const TranscriptMessageSchema = z.object({
  type: z.enum(['user_message', 'assistant_message']),
  message: z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  }),
  models: z.array(
    z.object({
      model: z.string(),
      entries: z.array(
        z.object({
          name: z.string(),
          score: z.number(),
        }),
      ),
      time: z
        .object({
          begin: z.number(),
          end: z.number(),
        })
        .nullish(),
    }),
  ),
});

export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;

export const AssistantEndMessageSchema = z.object({
  type: z.literal('assistant_end'),
});

export type AssistantEndMessage = z.infer<typeof AssistantEndMessageSchema>;

export const MessageSchema = z.union([
  AudioMessageSchema,
  TranscriptMessageSchema,
  AssistantEndMessageSchema,
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

export const parseTranscriptMessage = (
  message: unknown,
): TranscriptMessage | null => {
  if (typeof message === 'string') {
    try {
      const parsed = TranscriptMessageSchema.safeParse(JSON.parse(message));
      if (parsed.success) {
        return parsed.data;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const parseAssistantEndMessage = (
  message: unknown,
): AssistantEndMessage | null => {
  if (typeof message === 'string') {
    try {
      const parsed = AssistantEndMessageSchema.safeParse(JSON.parse(message));
      if (parsed.success) {
        return parsed.data;
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};

export type Message = z.infer<typeof MessageSchema>;

export const parseMessageData = async (
  data: unknown,
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

  const transcriptMessage = parseTranscriptMessage(data);
  if (transcriptMessage) {
    return {
      success: true,
      message: transcriptMessage,
    };
  }

  const assistantEndMessage = parseAssistantEndMessage(data);
  if (assistantEndMessage) {
    return {
      success: true,
      message: assistantEndMessage,
    };
  }

  return {
    success: false,
    error: new Error('Failed to parse transcript'),
  };
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
  return parseMessageData(data);
};
