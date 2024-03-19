import { isExpressionColor } from '@/utils/isExpressionColor';
import { useVoice } from '@humeai/voice-react';
import { expressionColors } from 'expression-colors';
import { Circle } from 'lucide-react';
import { FC, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';

type ProsodyScore = { name: string; score: string };

type LastVoiceMessageProps = {
  lastVoiceMessage: ReturnType<typeof useVoice>['lastVoiceMessage'];
};

const EmotionLabel = (prosody: ProsodyScore) => {
  const ref = useRef<HTMLDivElement>(null);

  const fill = isExpressionColor(prosody.name)
    ? expressionColors[prosody.name].hex
    : 'white';

  return (
    <LayoutGroup>
      <AnimatePresence>
        <motion.div
          className="mb-2 mr-2 inline-block last:mr-0"
          style={{ minWidth: ref.current?.offsetWidth }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeIn' }}
        >
          <motion.div
            ref={ref}
            layout
            className="rounded-full bg-tan-200/50 px-2 py-0.5 font-mono text-xs uppercase"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
                key={`emotion-label-${prosody.name}`}
                className="flex items-center gap-2"
              >
                <Circle fill={fill} stroke={'white'} className={'size-3'} />
                <span className="">{prosody.name}</span>
                <span className="ml-auto tabular-nums opacity-50">
                  {prosody.score}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </LayoutGroup>
  );
};

export const LastVoiceMessage: FC<LastVoiceMessageProps> = ({
  lastVoiceMessage,
}) => {
  const prosody = lastVoiceMessage?.models.prosody.scores ?? {};
  const sortedEmotions: ProsodyScore[] = Object.entries(prosody)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, value]) => ({ name: key, score: value }))
    .map((entry) => {
      return { ...entry, score: Number(entry.score).toFixed(2) };
    });

  return (
    <div className="pointer-events-none absolute top-48 px-6 text-center">
      <LayoutGroup>
        {sortedEmotions.map((emotion) => {
          return (
            <EmotionLabel
              key={`emotion-wrapper-${emotion.name}`}
              {...emotion}
            />
          );
        })}
      </LayoutGroup>
    </div>
  );
};
