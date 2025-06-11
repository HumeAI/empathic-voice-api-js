import { fetchAccessToken } from 'hume';

import { Voice } from '@/components/Voice';

export default async function Home() {
  const accessToken = await fetchAccessToken({
    apiKey: process.env.HUME_API_KEY || '',
    secretKey: process.env.HUME_SECRET_KEY || '',
  });

  return (
    <div className={'p-6'}>
      <h1 className={'my-4 text-lg font-medium'}>Hume EVI React Example</h1>

      {accessToken ? (
        <Voice accessToken={accessToken} />
      ) : (
        <div>Missing API Key</div>
      )}
    </div>
  );
}
