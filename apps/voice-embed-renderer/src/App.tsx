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
  const setAuthStrategy = useConfigStore((store) => store.setAuthStrategy);
  const authStrategy = useConfigStore((store) => store.authStrategy);

  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <MessageListener
          onUpdateConfig={(config) => {
            setAuthStrategy(config.auth);
          }}
        />
        {authStrategy ? (
          <Frame>
            <AnimatePresence mode={'wait'}>
              <VoiceProvider auth={authStrategy}>
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
