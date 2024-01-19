import { useEffect, useRef } from 'react';
import './App.css';
import { EmbeddedAssistant } from '@humeai/assistant';

function App() {
  const embeddedAssistant = useRef<EmbeddedAssistant | null>(null);

  useEffect(() => {
    embeddedAssistant.current = EmbeddedAssistant.create({
      rendererUrl: `http://localhost:3000`,
    });
    const unmount = embeddedAssistant.current.mount();

    return () => {
      unmount();
      embeddedAssistant.current = null;
    };
  }, []);

  return (
    <>
      <div>Demo of embedding assistant as an iframe</div>
    </>
  );
}

export default App;
