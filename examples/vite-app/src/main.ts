import type { AudioMessage, JSONMessage } from '@humeai/voice';
import { VoiceClient, createSocketConfig } from '@humeai/voice';

const body = document.querySelector('body')!;

const container = document.createElement('div');
body.appendChild(container);

const connectionState = document.createElement('div');
container.appendChild(connectionState);

const messageHistory = document.createElement('div');
container.appendChild(messageHistory);
messageHistory.innerHTML = `<div style="margin-top:20px;">Message History:</div>`;

const appendMessage = (message: JSONMessage | AudioMessage) => {
  const timestamp = new Date().toLocaleTimeString();

  const messageContainer = document.createElement('div');
  if (message.type === 'assistant_message' || message.type === 'user_message') {
    messageContainer.innerHTML = `[${timestamp}] ${message.message.role}: ${message.message.content}`;
  } else {
    messageContainer.innerHTML = `[${timestamp}] <Audio Blob>`;
  }

  messageHistory.appendChild(messageContainer);
};

const config = createSocketConfig({
  auth: {
    type: 'apiKey',
    value: String(import.meta.env['VITE_HUME_API_KEY']),
  },
});

const client = VoiceClient.create(config);

client.on('open', () => {
  connectionState.innerHTML = 'Connection State: connected';
});

client.on('message', (message) => {
  appendMessage(message);
});

client.on('close', () => {
  connectionState.innerHTML = 'Connection State: disconnected';
});

client.connect();
