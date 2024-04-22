<div align="center">
  <img src="https://storage.googleapis.com/hume-public-logos/hume/hume-banner.png">
  <h1>Hume AI Voice Embed React SDK</h1>
  <p>
    <strong>Integrate Hume's Empathic Voice Interface directly into your web application</strong>
  </p>
</div>

## Overview

This package enables you to integrate a widget that runs Hume's Empathic Voice Interface into your React application. It abstracts away the complexities of managing websocket connections, capturing user audio via the client's microphone, and handling the playback of the interface's audio responses. The widget is embedded into your web page through an iframe. 

There are two packages needed to embed your own widget. Install this package to embed the widget to your application. Code for the widget itself can be found at [https://github.com/HumeAI/empathic-voice-embed-renderer](https://github.com/HumeAI/empathic-voice-embed-renderer). 

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

`EmbeddedVoice` accepts all props that are accepted by the VoiceProvider in the [@humeai/voice-react package](https://github.com/HumeAI/empathic-voice-api-js/blob/main/packages/react).

In addition, it accepts a few other props specific to creating a widget:

| Prop              | Required | Description                                                                                                                                                                                                                                                                                                                         |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isEmbedOpen`       | yes      | Determines the initial visibility of the widget. Assign `true` to render the widget as open on initial load, and `false` to start with the widget closed. While the widget's UI provides a trigger to toggle its visibility, this prop also enables external control over the widget's visibility state through a parent component. |
| rendererUrl       | no       | URL where the widget itself is hosted. If blank, this defaults the Hume AI widget, https://voice-widget.hume.ai. An example of this widget can be found at [http://hume.ai](http://hume.ai).                                                                                                                                                                                                                                       |
| `onMessage`         | no       | Callback function to invoke upon receiving a message through the web socket.                                                                                                                                                                                                                                                        |
| `onClose`           | no       | Callback function to invoke upon the web socket connection being closed.                                                                                                                                                                                                                                                            |
| `openOnMount`           | no       | Boolean which indicates whether the widget should be initialized in an open or closed state. Set as `true` if you want it to be open. The default value is `false`.                                                                                                                                                                                                                                                             |

## Support

If you have questions or require assistance pertaining to this package, [reach out to us on Discord](https://hume.ai/discord)!
