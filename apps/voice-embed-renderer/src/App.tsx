import './App.css';
import { IframeGuard } from '@/components/IframeGuard';
import { IframeFallback } from '@/components/IframeFallback';
import { Views } from '@/views/Views';
import { MessageListener } from '@/components/MessageListener';
import { useConfigStore } from '@/store/config';
import { Frame } from './components/Frame';
import { AnimatePresence } from 'framer-motion';
import { type JSONMessage, VoiceProvider } from '@humeai/voice-react';
import { parentDispatch } from '@/utils/parentDispatch';
import { TRANSCRIPT_MESSAGE_ACTION } from '@humeai/voice-embed-react';

function App() {
  const setConfig = useConfigStore((store) => store.setConfig);
  const config = useConfigStore((store) => store.config);

  const dispatchMessage = (message: JSONMessage) => {
    parentDispatch(TRANSCRIPT_MESSAGE_ACTION(message));
  };

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
              <VoiceProvider {...config} onMessage={dispatchMessage}>
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
