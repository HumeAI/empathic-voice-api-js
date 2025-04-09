import 'server-only';
import { fetchAccessToken } from 'hume';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const apiKey = process.env.HUME_API_KEY;
  const secretKey = process.env.HUME_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      { error: 'Missing API or secret key' },
      { status: 400 },
    );
  }

  try {
    const accessToken = await fetchAccessToken({ apiKey, secretKey });
    return NextResponse.json({ accessToken });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch access token' },
      { status: 500 },
    );
  }
};
