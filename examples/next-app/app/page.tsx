import { fetchAccessToken } from '@humeai/voice';
import dynamic from 'next/dynamic';
import type { FC, PropsWithChildren } from 'react';

import { Voice } from '@/components/Voice';

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
      <h1 className={'my-4 text-lg font-medium'}>Hume EVI React Example</h1>

      <NoSSR>
        {accessToken ? (
          <Voice accessToken={accessToken} />
        ) : (
          <div>Missing API Key</div>
        )}
      </NoSSR>
    </div>
  );
}
