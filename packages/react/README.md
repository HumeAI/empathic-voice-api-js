<div align="center">
  <img src="https://storage.googleapis.com/hume-public-logos/hume/hume-banner.png">
  <h1>Hume AI EVI React SDK</h1>
  <p>
    <strong>Integrate Hume's Empathic Voice Interface in your React application</strong>
  </p>
</div>

## Overview

This is the React SDK for Hume's Empathic Voice Interface, making it easy to integrate the voice API into your own front-end application. The SDK abstracts the complexities of managing websocket connections, capturing user audio via the client's microphone, and handling the playback of the interface's audio responses.

## Prerequisites

Before installing this package, please ensure your development environment meets the following requirement:

- Node.js (`v18.0.0` or higher).

To verify your Node.js version, run this command in your terminal:

```sh
node --version
```

If your Node.js version is below `18.0.0`, update it to meet the requirement. For updating Node.js, visit [Node.js' official site](https://nodejs.org/) or use a version management tool like nvm for a more seamless upgrade process.

## Installation

Add `@humeai/voice-react` to your project by running this command in your project directory:

```bash
npm install @humeai/voice-react
```

This will download and include the package in your project, making it ready for import and use within your React components.

```tsx
import { VoiceProvider } from '@humeai/voice-react';
```

## Usage

### Quickstart

To use the SDK, wrap your components in the `VoiceProvider`, which will enable your components to access available voice methods. Here's a simple example to get you started:

```tsx
import React, { useState } from 'react';
import { EmbeddedVoice } from '@humeai/voice-react';

function App() {
  const apiKey = process.env.HUME_API_KEY || '';
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);

  return (
    <>
      <VoiceProvider
        auth={{ type: 'apiKey', value: apiKey }}
        hostname={process.env.HUME_VOICE_HOSTNAME || 'api.hume.ai'}
      >
        <ExampleComponent />
      </VoiceProvider>
    </>
  );
}
```

### Configuring VoiceProvider

The table below outlines the props accepted by `VoiceProvider`:

| Prop              | Required | Description                                                                                                                                                                                                                                                                                                                         |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth              | yes      | Authentication strategy and corresponding value. Authentication is required to establish the web socket connection with Hume's Voice API. See our [documentation](https://dev.hume.ai/docs/quick-start#getting-your-api-key) on obtaining your `API key` or `access token`.                                                         |
| hostname          | no       | Hostname of the Hume API. If not provided this value will default to `"api.hume.ai"`.                                                                                                                                                                                                                                               |
| reconnectAttempts | no       | Number of times to attempt to reconnect to the API. If not provided this value will default to `30`.                                                                                                                                                                                                                                |
| debug             | no       | Enable debug mode. If not provided this value will default to `false`.                                                                                                                                                                                                                                                              |
| configId      | no       | If you have a configuration ID with voice presets, pass the config ID here.                                                                                                                                                             |
| configVersion      | no       | If you wish to use a specific version of your config, pass in the version ID here.                                                                                                                                                              |
| onMessage         | no       | Callback function to invoke upon receiving a message through the web socket.                                                                                                                                                                                                                                                        |
| onClose           | no       | Callback function to invoke upon the web socket connection being closed.                                                                                                                                                                                                                                                            |
| clearMessagesOnDisconnect           | no       | Boolean which indicates whether you want to clear message history when the call ends.                                                                                                                                                                                                               |
| messageHistoryLimit           | no       | Set the number of messages that you wish to keep over the course of the conversation. The default value is 100.                                                                                                                                                                                                               |
| sessionSettings           | no       | Optional settings for the session where you can set microphone input values, context, or pass in your own API key for the underlying LLM.                                                                                                                                                                                                               |

## Using the Voice

After you have set up your voice provider, you will be able to access various properties and methods to use the voice in your application. In any component that is a child of `VoiceProvider`, access these methods by importing the `useVoice` custom hook.

```jsx
// ExampleComponent is nested within VoiceProvider
import { useVoice } from '@humeai/voice-react';

export const ExampleComponent = () => {
  const { connect } = useVoice();
}
```

### Methods

| Method                      | Usage                                                                     |
|-----------------------------|---------------------------------------------------------------------------|
| `connect: () => Promise`    | Opens a socket connection to the voice API and initializes the microphone. |
| `disconnect: () => void`    | Disconnect from the voice API and microphone.                             |
| `clearMessages: () => void` | Clear transcript messages from history.                                   |
| `mute: () => void` | Mute the microphone                                   |
| `unmute: () => void` | Unmute the microphone                                   |
| `sendSessionSettings: (text: string) => void` | Send new session settings to the assistant. This overrides any session settings that were passed as props to the VoiceProvider.                                   |
| `sendUserInput: (text: string) => void` | Send a user input message.                                   |
| `sendAssistantInput: (text: string) => void` | Send a text string for the assistant to read out loud.                                   |

### Properties

| Property                      | Type                                          | Description                                            |
|-----------------------------|-----------------------------------------------|--------------------------------------------------------|
| `isMuted`                   | `boolean`                                       | Boolean that describes whether the microphone is muted |
| `isPlaying`    | `boolean` |   Describes whether the assistant audio is currently playing.                                                     |
| `fft` | `number[]` |            Audio FFT values for the assistant audio output.              |                                     |
| `micFft` | `number[]` |           Audio FFT values for microphone input.              |                                     |
| `messages` | `UserTranscriptMessage`, `AssistantTranscriptMessage`, `ConnectionMessage`, `UserInterruptionMessage`, or `JSONErrorMessage` | Message history of the current conversation.       |          
| `lastVoiceMessage` | `AssistantTranscriptMessage` or `null` | The last transcript message received from the assistant.       |          
| `lastUserMessage` | `UserTranscriptMessage` or `null` | The last transcript message received from the user.       |          
| `readyState` | `VoiceReadyState` | The current readyState of the websocket connection.      |          
| `readyState` | `VoiceReadyState` | The current readyState of the websocket connection.      |          
| `status` | `VoiceStatus` | The current status of the voice connection. Informs you of whether the voice is connected, disconnected, connecting, or error. If the voice is in an error state, it will automatically disconnect from the websocket and microphone.     |          
| `error` | `VoiceError` | Provides more detailed error information if the voice is in an error state.      |          
| `isError` | `boolean` | If true, the voice is in an error state.      |          
| `isAudioError` | `boolean` | If true, an audio playback error has occurred.      |          
| `isMicrophoneError` | `boolean` | If true, a microphone error has occurred.      |          
| `isSocketError` | `boolean` | If true, there was an error connecting to the websocket.      |          
| `callDurationTimestamp` | `string` or `null` | The length of a call. This value persists after the conversation has ended.      |          



## Support

If you have questions or require assistance pertaining to this package, [reach out to us on Discord](https://hume.ai/discord)!
