import { z } from 'zod';

import { Voice } from '@/components/Voice';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const accessToken = await fetch(new URL('http://localhost:3003/access-token'))
    .then((res) => res.json())
    .then((json: unknown) => {
      return z
        .object({
          accessToken: z.string(),
        })
        .transform((data) => data.accessToken)
        .parse(json);
    });

  return (
    <div className={'mx-auto max-w-4xl'}>
      <h1 className={'mb-4 mt-10 px-6 text-lg font-medium'}>
        Hume EVI React Example
      </h1>

      {accessToken ? (
        <Voice accessToken={accessToken} />
      ) : (
        <div>Missing Access Token Key</div>
      )}
    </div>
  );
}
