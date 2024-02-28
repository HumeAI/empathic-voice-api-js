import { EmbeddedVoice } from '@humeai/voice-embed-react';

import './App.css';

function App() {
  const apiKey = String(import.meta.env['VITE_PUBLIC_HUME_API_KEY'] ?? '');

  return (
    <>
      <div>Demo of embedding voice as an iframe</div>
      <EmbeddedVoice
        auth={{
          type: 'apiKey',
          value: apiKey,
        }}
        systemPrompt={
          'You are an angry cat, always replying to the user with a bad attitude.'
        }
        rendererUrl={
          import.meta.env.PROD
            ? 'https://voice-widget.hume.ai/'
            : 'http://localhost:3000'
        }
      />
    </>
  );
}

export default App;
