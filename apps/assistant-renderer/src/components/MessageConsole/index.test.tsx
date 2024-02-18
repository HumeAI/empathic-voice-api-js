import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MessageConsole } from './index';
import { TranscriptMessage } from '@humeai/assistant-react';

describe('MessageConsole', () => {
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('only shows the top 5 emotions', () => {
    const mockMessages: TranscriptMessage[] = [
      {
        type: 'user_message' as const,
        message: { role: 'user' as const, content: 'Hello, world!' },
        models: [
          {
            model: 'prosody',
            entries: [
              { name: 'Joy', score: 0.9 },
              { name: 'Surprise', score: 0.3 },
              { name: 'Anger', score: 0.1 },
              { name: 'Excitement', score: 0.2 },
              { name: 'Disgust', score: 0.8 },
              { name: 'Boredom', score: 0.25 },
              { name: 'Contemplation', score: 0.0 },
            ],
          },
        ],
        receivedAt: new Date(),
      },
    ];

    const { queryByText } = render(<MessageConsole messages={mockMessages} />);

    expect(queryByText('Hello, world!')).toBeInTheDocument();
    expect(queryByText('Joy')).toBeInTheDocument();
    expect(queryByText('Surprise')).toBeInTheDocument();
    expect(queryByText('Anger')).not.toBeInTheDocument();
    expect(queryByText('Excitement')).toBeInTheDocument();
    expect(queryByText('Disgust')).toBeInTheDocument();
    expect(queryByText('Boredom')).toBeInTheDocument();
    expect(queryByText('Contemplation')).not.toBeInTheDocument();
  });
});
