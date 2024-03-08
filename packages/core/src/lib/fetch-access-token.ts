/**
 * @name fetchAccessToken
 * @description
 * Fetch an access token from the Hume API.
 * @param args - The arguments for the request.
 * @returns
 * A new access token.
 * @example
 * ```ts
 * const accessToken = await fetchAccessToken({
 * apiKey: '
 * test',
 * clientSecret
 * : 'test',
 * });
 * ```
 */
export const fetchAccessToken = async (args: {
  apiKey: string;
  clientSecret: string;
  host?: string;
}): Promise<string> => {
  const { apiKey, clientSecret, host = 'api.hume.ai' } = args;

  const authString = `${apiKey}:${clientSecret}`;
  const encoded = Buffer.from(authString).toString('base64');

  const res = await fetch(`https://${host}/oauth2-cc/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encoded}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }).toString(),
    cache: 'no-cache',
  });

  const data = (await res.json()) as { access_token: string };

  const accessToken = String(data['access_token']);
  return accessToken;
};
