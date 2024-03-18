import { Fragment, useEffect, useMemo, useRef } from 'react';
import type {
  AgentTranscriptMessage,
  UserTranscriptMessage,
  useVoice,
} from '@humeai/voice-react';
import { match } from 'ts-pattern';
import { expressionColors } from 'expression-colors';
import { AnimatePresence, motion } from 'framer-motion';

type Emotion = keyof typeof expressionColors;
type ProsodyScore = { name: string; score: string };

export const MessageConsole = ({
  messages,
}: {
  messages: ReturnType<typeof useVoice>['messages'];
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formattedMessages = useMemo(() => {
    return messages.reduce<
      {
        sender: 'user' | 'assistant';
        message: UserTranscriptMessage | AgentTranscriptMessage;
        sortedEmotions: ProsodyScore[];
      }[]
    >((state, message) => {
      if (
        message.type === 'socket_connected' ||
        message.type === 'socket_disconnected' ||
        message.type === 'user_interruption' ||
        message.type === 'error'
      ) {
        return state;
      }

      const sender = match(message.type)
        .with('user_message', () => 'user' as const)
        .with('assistant_message', () => 'assistant' as const)
        .otherwise(() => null);

      if (sender === null) {
        return state;
      }

      // Sort the emotions based on their scores in ascending order
      const prosodyScores = message.models.prosody.scores;
      const sortedEmotions: ProsodyScore[] = Object.entries(prosodyScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key, value]) => ({ name: key, score: value }))
        .map((entry) => {
          return { ...entry, score: Number(entry.score).toFixed(3) };
        });

      return state.concat([
        {
          sender,
          message,
          sortedEmotions,
        },
      ]);
    }, []);
  }, [messages]);

  const connectionMessage = useMemo(
    () =>
      messages.length > 0
        ? messages.find((m) => m.type === 'socket_connected')
        : null,
    [messages],
  );

  return (
    <div className="z-10 mb-2 h-80 w-full overflow-auto rounded-md px-6">
      <div className="pb-2 text-xs italic text-gray-500">Connecting...</div>
      {connectionMessage ? (
        <div className="pb-4 text-xs italic text-gray-500">
          You are connected. Start talking!
        </div>
      ) : null}
      <div className="grid w-full grid-cols-2 gap-x-2 gap-y-4">
        {formattedMessages.map(({ message, sender, sortedEmotions }, index) => {
          return (
            <Fragment key={index}>
              <div>
                <div
                  className={
                    'pb-0.5 font-mono text-[10px] uppercase text-gray-500'
                  }
                >
                  {sender}
                </div>
                <div className={'pr-4 text-sm font-medium'}>
                  {message.message.content}
                </div>
              </div>

              <div className="flex flex-col gap-1 pl-1">
                <div
                  className={
                    'pb-0.5 font-mono text-[10px] uppercase text-gray-500'
                  }
                >
                  Tone of voice
                </div>
                {sortedEmotions.map((e) => {
                  const barColor =
                    expressionColors[e.name as Emotion]?.hex ?? 'black';
                  return (
                    <div key={index + e.name + e.score} className={'text-xs'}>
                      <div className={'flex items-center pb-0.5'}>
                        <span className={'grow truncate tracking-tight'}>
                          {e.name}
                        </span>
                        <span className={'grow-0 tabular-nums'}>{e.score}</span>
                      </div>
                      <div className={'relative h-[4px] w-full rounded-full'}>
                        <div
                          className={
                            'absolute left-0 top-0 h-full w-[var(--w)] rounded-full'
                          }
                          style={{
                            background: 'black',
                            width: '100%',
                            opacity: 0.1,
                          }}
                        />
                        <AnimatePresence>
                          <motion.div
                            className={
                              'absolute left-0 top-0 h-full w-[var(--w)] rounded-full'
                            }
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${100 * Number(e.score)}%`,
                              transition: {
                                delay: 0.5,
                              },
                            }}
                            style={{
                              background: barColor,
                            }}
                          />
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Fragment>
          );
        })}
      </div>

      <div ref={messagesEndRef} />
    </div>
  );
};
