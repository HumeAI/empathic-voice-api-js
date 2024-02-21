export class SocketUnknownMessageError extends Error {
  constructor(message?: string) {
    super(`Unknown message type.${message ? ' ' + message : ''}`);
    this.name = 'SocketUnknownMessageError';
  }
}

export const isSocketUnknownMessageError = (
  err: unknown,
): err is SocketUnknownMessageError => {
  return err instanceof SocketUnknownMessageError;
};

export class SocketFailedToParseMessageError extends Error {
  constructor(message?: string) {
    super(
      `Failed to parse message from socket.${message ? ' ' + message : ''}`,
    );
    this.name = 'SocketFailedToParseMessageError';
  }
}

export const isSocketFailedToParseMessageError = (
  err: unknown,
): err is SocketFailedToParseMessageError => {
  return err instanceof SocketFailedToParseMessageError;
};
