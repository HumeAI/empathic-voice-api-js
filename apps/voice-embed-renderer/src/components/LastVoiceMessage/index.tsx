import { isExpressionColor } from '@/utils/isExpressionColor';
import { useVoice } from '@humeai/voice-react';
import { expressionColors } from 'expression-colors';
import { Circle } from 'lucide-react';
import { FC } from 'react';

type ProsodyScore = { name: string; score: string };

type LastVoiceMessageProps = {
  lastVoiceMessage: ReturnType<typeof useVoice>['lastVoiceMessage'];
};

export const LastVoiceMessage: FC<LastVoiceMessageProps> = ({
  lastVoiceMessage,
}) => {
  const prosody = lastVoiceMessage?.models[0].entries ?? [];
  const sortedEmotions: ProsodyScore[] = prosody
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => {
      return { ...entry, score: Number(entry.score).toFixed(2) };
    });

  return (
    <div className="pointer-events-none absolute top-48 px-4 text-center">
      {sortedEmotions.map((emotion) => {
        const fill = isExpressionColor(emotion.name)
          ? expressionColors[emotion.name].hex
          : 'white';

        return (
          <div className="mb-2 mr-2 inline-flex items-center gap-2 rounded-full bg-tan-200/50 px-2 py-0.5 font-mono text-xs uppercase last:mr-0">
            <Circle fill={fill} stroke={'white'} className={'size-3'}/>
            <span className="">{emotion.name}</span>
            <span className="ml-auto tabular-nums opacity-50">
              {emotion.score}
            </span>
          </div>
        );
      })}
    </div>
  );
};
