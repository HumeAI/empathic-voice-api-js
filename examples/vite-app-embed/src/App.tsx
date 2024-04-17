import { EmbeddedVoice } from '@humeai/voice-embed-react';

import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const apiKey = String(import.meta.env['VITE_PUBLIC_HUME_API_KEY'] ?? '');
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [openOnMount, setIsOpenOnMount] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const launch = urlParams.get('launchWidget');
    if (launch === 'true') {
      setIsOpenOnMount(true);
    }
  }, []);

  return (
    <>
      <div>Demo of embedding voice as an iframe</div>
      <button onClick={() => setIsEmbedOpen(true)}>Open widget</button>
      <EmbeddedVoice
        auth={{
          type: 'apiKey',
          value: apiKey,
        }}
        rendererUrl={
          import.meta.env.PROD
            ? 'https://voice-widget.hume.ai/'
            : 'http://localhost:3000'
        }
        onMessage={(msg) => {
          console.log('we got a message', msg);
        }}
        onClose={() => {
          setIsEmbedOpen(false);
        }}
        isEmbedOpen={isEmbedOpen}
        hostname={String(
          import.meta.env['VITE_PUBLIC_HOSTNAME'] ?? 'api.hume.ai',
        )}
        openOnMount={openOnMount}
      />
    </>
  );
}

export default App;
