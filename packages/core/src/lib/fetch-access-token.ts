function isLocalhostHost(host: string): boolean {
  const hostname = host.trim().split(':')[0] || '';
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

function base64Encode(str: string): string {
  if (typeof Buffer === 'function') {
    // Node.js environment
    return Buffer.from(str).toString('base64');
  } else if (typeof btoa === 'function') {
    // Browser environment
    return btoa(str);
  } else {
    throw new Error('Base64 encoding not supported in this environment.');
  }
}

/**
 * Fetches a new access token from the Hume API using the provided API key and client secret.
 *
 * @param args - The arguments for the request.
 * @returns Promise that resolves to the new access token.
 * @throws If the base64 encoding fails.
 * @throws If the network request fails.
 * @example
 * ```typescript
 * async function getToken() {
 *   const accessToken = await fetchAccessToken({
 *     apiKey: 'test',
 *     clientSecret: 'test',
 *   });
 *   console.log(accessToken); // Outputs the access token
 * }
 * ```
 */
export const fetchAccessToken = async (args: {
  apiKey: string;
  clientSecret: string;
  host?: string;
}): Promise<string> => {
  const { apiKey, clientSecret, host = 'api.hume.ai' } = args;

  try {
    const protocol = isLocalhostHost(host) ? 'http' : 'https';

    const authString = `${apiKey}:${clientSecret}`;
    const encoded = base64Encode(authString);

    const res = await fetch(`${protocol}://${host}/oauth2-cc/token`, {
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

    if (!res.ok) {
      throw new Error(`Failed to fetch access token: ${res.statusText}`);
    }

    const data = (await res.json()) as { access_token: string };

    const accessToken = String(data['access_token']);
    return accessToken;
  } catch (e) {
    throw e;
  }
};
