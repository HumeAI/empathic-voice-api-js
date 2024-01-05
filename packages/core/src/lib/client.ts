import { Config } from './create-config';
import { createSocketUrl } from './create-url';
import { Message, parseMessageType } from './message';

export type AssistantEventMap = {
  message?: (message: Message) => void;
  ready?: () => void;
  open?: () => void;
  close?: () => void;
  error?: (error: Error) => void;
};

export class AssistantClient {
  private socket?: WebSocket;
  private url: string;
  private eventHandlers: AssistantEventMap = {};
  private reconnectAttempts = 0;

  private constructor(config: Config) {
    this.url = createSocketUrl(config);
  }

  static create(config: Config) {
    return new AssistantClient(config);
  }

  on<T extends keyof AssistantEventMap>(
    event: T,
    callback: AssistantEventMap[T],
  ) {
    this.eventHandlers[event] = callback;
  }

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.binaryType = 'arraybuffer';

    this.socket.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      this.eventHandlers.open?.();
    });

    this.socket.addEventListener('message', (event) => {
      parseMessageType(event).then((result) => {
        if (result.success) {
          this.eventHandlers.message?.(result.message);
        } else {
          this.eventHandlers.error?.(result.error);
        }
      });
    });

    this.socket.addEventListener('close', () => {
      if (this.reconnectAttempts < 30) {
        this.reconnectAttempts += 1;
        this.connect();
      } else {
        this.eventHandlers.error?.(
          new Error(
            `Websocket closed after ${this.reconnectAttempts} reconnect attempts`,
          ),
        );
      }
    });

    this.socket.addEventListener('error', (event) => {
      this.eventHandlers.error?.(new Error('WebSocket error.'));
    });

    return this;
  }

  disconnect() {
    this.socket?.close();
    this.socket = undefined;
  }

  sendAudio(audioBuffer: ArrayBufferLike) {
    if (!this.socket) {
      throw new Error('Socket is not connected.');
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open.');
    }

    this.socket.send(audioBuffer);
  }
}
