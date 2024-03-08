<div align="center">
  <img src="https://storage.googleapis.com/hume-public-logos/hume/hume-banner.png">
  <h1>Hume AI Voice Embed</h1>
  <p>
    <strong>Integrate Hume's Empathic Voice Interface directly into your web application</strong>
  </p>
</div>

## Overview

This package provides a React widget component that encapsulates Hume's Empathic Voice Interface, making it easy to integrate this interface into your web application. The component is designed to be embedded into your web page through an iframe. It abstracts away the complexities of managing websocket connections, capturing user audio via the client's microphone, and handling the playback of the interface's audio responses. Use this widget to give your website a voice! 

## Prerequisites

Before installing this package, please ensure your development environment meets the following requirement:

- Node.js (`v18.0.0` or higher).

To verify your Node.js version, run this command in your terminal:

```sh
node --version
```

If your Node.js version is below `18.0.0`, update it to meet the requirement. For updating Node.js, visit [Node.js' official site](https://nodejs.org/) or use a version management tool like nvm for a more seamless upgrade process.

## Installation

Add `@humeai/voice-embed-react` to your project by running this command in your project directory:

```bash
npm install @humeai/voice-embed-react
```

This will download and include the package in your project, making it ready for import and use within your React components.

```tsx
import { EmbeddedVoice } from '@humeai/voice-embed-react';
```

## Usage

### Quickstart

Here's a simple example to get you started with the `EmbeddedVoice` component:

```tsx
import React, { useState } from 'react';
import { EmbeddedVoice } from '@humeai/voice-embed-react';

function App() {
  const apiKey = process.env.HUME_API_KEY || '';
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsEmbedOpen(true)}>Open Widget</button>
      <EmbeddedVoice
        auth={{ type: 'apiKey', value: apiKey }}
        systemPrompt={'Your system prompt goes here.'}
        onMessage={(msg) => console.log('Message received: ', msg)}
        onClose={() => setIsEmbedOpen(false)}
        isEmbedOpen={isEmbedOpen}
      />
    </div>
  );
}
```

**Note:** For integration within server components, instantiate `EmbeddedVoice` within a client component. For more information checkout the [Next.js documentation on client components](https://nextjs.org/docs/app/building-your-application/rendering/client-components).

### Component Props

The table below outlines the props accepted by the EmbeddedVoice component:

| prop              | required | description                                                                                                                                                                                                                                                                                                                         |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth              | yes      | Authentication strategy and corresponding value. Authentication is required to establish the web socket connection with Hume's Voice API. See our [documentation](https://dev.hume.ai/docs/quick-start#getting-your-api-key) on obtaining your `API key` or `access token`.                                                         |
| isEmbedOpen       | yes      | Determines the initial visibility of the widget. Assign `true` to render the widget as open on initial load, and `false` to start with the widget closed. While the widget's UI provides a trigger to toggle its visibility, this prop also enables external control over the widget's visibility state through a parent component. |
| rendererUrl       | no       | URL of the webpage to inject the `EmbeddedVoice` widget into.                                                                                                                                                                                                                                                                       |
| hostname          | no       | Hostname of the Hume API. If not provided this value will default to `"api.hume.ai"`.                                                                                                                                                                                                                                               |
| channels          | no       | Number of channels in the input audio.                                                                                                                                                                                                                                                                                              |
| sampleRate        | no       | Sample rate of the input audio.                                                                                                                                                                                                                                                                                                     |
| tts               | no       | Text-To-Speech service. If not provided this value will default to `"hume_ai"`, specifying Hume's text-to-speech service. Other options include: `"eleven_labs"` and `"play_ht"`.                                                                                                                                                   |
| speedRatio        | no       | Speed ratio of the TTS service.                                                                                                                                                                                                                                                                                                     |
| reconnectAttempts | no       | Number of times to attempt to reconnect to the API. If not provided this value will default to `30`.                                                                                                                                                                                                                                |
| debug             | no       | Enable debug mode. If not provided this value will default to `false`.                                                                                                                                                                                                                                                              |
| systemPrompt      | no       | System prompt to use for the Voice. The provided system prompt has a character limit of `1900` characters.                                                                                                                                                                                                                          |
| no_binary         | no       | Audio output format for Voice responses. If not provided this value will default to `false`.                                                                                                                                                                                                                                        |
| onMessage         | no       | Callback function to invoke upon receiving a message through the web socket.                                                                                                                                                                                                                                                        |
| onClose           | no       | Callback function to invoke upon the web socket connection being closed.                                                                                                                                                                                                                                                            |

## Support

If you have questions or require assistance pertaining to this package, [reach out to us on Discord](https://discord.com/invite/WPRSugvAm6)!
