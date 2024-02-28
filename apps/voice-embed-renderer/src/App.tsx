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
  const setConfig = useConfigStore((store) => store.setConfig);
  const config = useConfigStore((store) => store.config);

  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <MessageListener
          onUpdateConfig={(config) => {
            setConfig(config);
          }}
        />
        {config ? (
          <Frame>
            <AnimatePresence mode={'wait'}>
              <VoiceProvider {...config}>
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
