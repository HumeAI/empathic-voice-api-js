import { AssistantProvider } from '@humeai/assistant-react';
import dynamic from 'next/dynamic';
import type { FC, PropsWithChildren } from 'react';

import { ExampleComponent } from '@/components/ExampleComponent';
import { fetchAccessToken } from '@/utils/fetch-access-token';

const NoOp: FC<PropsWithChildren<Record<never, never>>> = ({ children }) => (
  <>{children}</>
);

const NoSSR = dynamic(
  () => new Promise<typeof NoOp>((resolve) => resolve(NoOp)),
  { ssr: false },
);

export default async function Home() {
  const accessToken = await fetchAccessToken({
    apiKey: process.env.HUME_API_KEY || '',
    clientSecret: process.env.HUME_CLIENT_SECRET || '',
  });

  return (
    <div className={'p-6'}>
      <h1 className={'font-medium'}>Hume Assistant Example Component</h1>

      <NoSSR>
        {accessToken ? (
          <AssistantProvider
            auth={{ type: 'access_token', value: accessToken }}
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
