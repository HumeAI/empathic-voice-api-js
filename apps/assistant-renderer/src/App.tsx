import './App.css';
import { IframeGuard } from './components/IframeGuard';
import { IframeFallback } from './components/IframeFallback';
import { AssistantUI } from './components/AssistantUI';
import { MessageListener } from './components/MessageListener';
import { useConfigStore } from './store/config';
import { IframeReady } from './components/IframeReady';

function App() {
  const setApiKey = useConfigStore((store) => store.setApiKey);
  const apiKey = useConfigStore((store) => store.apiKey);

  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <IframeReady />
        <MessageListener
          onUpdateConfig={(config) => {
            const apiKey = config.apiKey;
            setApiKey(apiKey);
          }}
        />
        {apiKey ? <AssistantUI apiKey={apiKey} /> : null}
      </IframeGuard>
    </>
  );
}

export default App;
