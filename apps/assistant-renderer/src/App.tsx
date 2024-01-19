import './App.css';
import { IframeGuard } from './components/IframeGuard';
import { IframeFallback } from './components/IframeFallback';
import { AssistantUI } from './components/AssistantUI';

function App() {
  return (
    <>
      <IframeGuard fallback={IframeFallback}>
        <AssistantUI />
      </IframeGuard>
    </>
  );
}

export default App;
