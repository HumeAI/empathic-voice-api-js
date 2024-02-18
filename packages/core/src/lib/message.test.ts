import { describe, expect, it } from 'vitest';

import { parseMessageData } from './message';

describe('parseMessageData', () => {
  it('should return an error message if the message is not a valid json string', async () => {
    const output = await parseMessageData('not valid json');
    expect(output.success).toBe(false);
  });

  it('should return a success message if the message is a user transcript message', async () => {
    const output = await parseMessageData(
      JSON.stringify({
        type: 'user_message',
        message: {
          role: 'user',
          content: 'Hi.',
        },
        id: 'abc',
        models: [
          {
            model: 'prosody',
            entries: [
              {
                name: 'Admiration',
                score: 0.03162447735667229,
              },
              {
                name: 'Adoration',
                score: 0.03475363552570343,
              },
              {
                name: 'Aesthetic Appreciation',
                score: 0.024020226672291756,
              },
            ],
            time: {
              begin: 640,
              end: 1140,
            },
          },
        ],
      }),
    );
    expect(output.success).toBe(true);
  });

  it('should return a success message if the message is an assistant transcript message', async () => {
    const output = await parseMessageData(
      JSON.stringify({
        type: 'assistant_message',
        id: 'fd9c405504344599be06f0e6bf5b941e',
        message: {
          role: 'assistant',
          content: 'Hey there!',
        },
        models: [
          {
            model: 'prosody',
            entries: [
              {
                name: 'Admiration',
                score: 0.07727637141942978,
              },
              {
                name: 'Adoration',
                score: 0.05045051500201225,
              },
              {
                name: 'Aesthetic Appreciation',
                score: 0.04880306124687195,
              },
              {
                name: 'Amusement',
                score: 0.1744036227464676,
              },
            ],
          },
        ],
      }),
    );
    expect(output.success).toBe(true);
  });

  it('should return a success message if the message is an assistant end message', async () => {
    const output = await parseMessageData(
      JSON.stringify({ type: 'assistant_end' }),
    );
    expect(output.success).toBe(true);
  });
});
