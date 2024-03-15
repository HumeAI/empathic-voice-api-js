import { IframeFallback } from '@/components/IframeFallback';
import { IframeGuard } from '@/components/IframeGuard';
import { MessageListener } from '@/components/MessageListener';
import { useConfigStore } from '@/store/config';
import { useLayoutStore } from '@/store/layout';
import { parentDispatch } from '@/utils/parentDispatch';
import { Views } from '@/views/Views';
import { TRANSCRIPT_MESSAGE_ACTION } from '@humeai/voice-embed-react';
import { VoiceProvider } from '@humeai/voice-react';
import { AnimatePresence } from 'framer-motion';
import { ComponentProps } from 'react';
import './App.css';
import { Frame } from './components/Frame';

function App() {
  const setConfig = useConfigStore((store) => store.setConfig);
  const config = useConfigStore((store) => store.config);

  const open = useLayoutStore((store) => store.open);
  const setFrameSize = useLayoutStore((store) => store.setFrameSize);

  const dispatchMessage: ComponentProps<typeof VoiceProvider>['onMessage'] = (
    message,
  ) => {
    if (
      message.type === 'user_message' ||
      message.type === 'assistant_message'
    ) {
      parentDispatch(TRANSCRIPT_MESSAGE_ACTION(message));
    }
  };

  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <MessageListener
          onUpdateConfig={(config) => {
            setConfig(config);
          }}
          onOpen={(dimensions) => {
            setFrameSize(dimensions);
            open(dimensions);
          }}
          onResize={(dimensions) => {
            setFrameSize(dimensions);
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
