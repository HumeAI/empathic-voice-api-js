import { AssistantProvider } from '@humeai/assistant-react';
import dynamic from 'next/dynamic';
import type { FC, PropsWithChildren } from 'react';

import { ExampleComponent } from '@/components/ExampleComponent';

const NoOp: FC<PropsWithChildren<Record<never, never>>> = ({ children }) => (
  <>{children}</>
);

const NoSSR = dynamic(
  () => new Promise<typeof NoOp>((resolve) => resolve(NoOp)),
  { ssr: false },
);

export default function Home() {
  const apiKey = process.env['NEXT_PUBLIC_HUME_API_KEY'];

  return (
    <div className={'p-6'}>
      <h1 className={'font-medium'}>Hume Assistant Example Component</h1>

      <NoSSR>
        {apiKey ? (
          <AssistantProvider
            auth={{ type: 'apiKey', value: apiKey }}
            hostname={'api.hume.ai'}
          >
            <ExampleComponent />
          </AssistantProvider>
        ) : (
          <div>Missing API Key</div>
        )}
      </NoSSR>
    </div>
  );
}
