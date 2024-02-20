import './App.css';
import { IframeGuard } from '@/components/IframeGuard';
import { IframeFallback } from '@/components/IframeFallback';
import { Views } from '@/views/Views';
import { MessageListener } from '@/components/MessageListener';
import { useConfigStore } from '@/store/config';
import { Frame } from './components/Frame';
import { AnimatePresence } from 'framer-motion';
import { VoiceProvider } from '@humeai/voice-react';

function App() {
  const setApiKey = useConfigStore((store) => store.setApiKey);
  const apiKey = useConfigStore((store) => store.apiKey);

  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <MessageListener
          onUpdateConfig={(config) => {
            const apiKey = config.auth.value;
            setApiKey(apiKey);
          }}
        />
        {apiKey ? (
          <Frame>
            <AnimatePresence mode={'wait'}>
              <VoiceProvider auth={{ type: 'apiKey', value: apiKey }}>
                <Views />
              </VoiceProvider>
            </AnimatePresence>
          </Frame>
        ) : null}
      </IframeGuard>
    </>
  );
}

export default App;
