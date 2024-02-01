import './App.css';
import { IframeGuard } from '@/components/IframeGuard';
import { IframeFallback } from '@/components/IframeFallback';
import { Views } from '@/views/Views';
import { MessageListener } from '@/components/MessageListener';
import { useConfigStore } from '@/store/config';
import { Frame } from './components/Frame';
import { AnimatePresence } from 'framer-motion';

function App() {
  const setApiKey = useConfigStore((store) => store.setApiKey);
  const apiKey = useConfigStore((store) => store.apiKey);

  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <MessageListener
          onUpdateConfig={(config) => {
            const apiKey = config.apiKey;
            setApiKey(apiKey);
          }}
        />
        {apiKey ? (
          <Frame>
            <AnimatePresence mode={'wait'}>
              <Views apiKey={apiKey} />
            </AnimatePresence>
          </Frame>
        ) : null}
      </IframeGuard>
    </>
  );
}

export default App;
