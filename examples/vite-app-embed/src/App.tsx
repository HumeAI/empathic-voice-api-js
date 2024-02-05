import { EmbeddedAssistant } from '@humeai/assistant-react';

import './App.css';

function App() {
  const apiKey = String(import.meta.env['VITE_PUBLIC_HUME_API_KEY'] ?? '');

  return (
    <>
      <div>Demo of embedding assistant as an iframe</div>
      <EmbeddedAssistant
        auth={{
          type: 'apiKey',
          value: apiKey,
        }}
        rendererUrl={
          import.meta.env.PROD
            ? 'https://assistant-widget.hume.ai/'
            : 'http://localhost:3000'
        }
      />
    </>
  );
}

export default App;
