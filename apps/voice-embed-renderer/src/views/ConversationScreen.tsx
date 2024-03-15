import { LastVoiceMessage } from '@/components/LastVoiceMessage';
import { VoiceAnimationState } from '@/components/VoiceAnimation';
import { WaitingPrompt } from '@/components/WaitingPrompt';
import { WebGLAvatar } from '@/components/WebGLAvatar';
import { Backdrop } from '@/components/WebGLBackdrop';
import { useVoice } from '@humeai/voice-react';

export const ConversationScreen = () => {
  const { lastVoiceMessage, isPlaying, micFft, lastUserMessage } = useVoice();
  return (
    <>
      <LastVoiceMessage lastVoiceMessage={lastVoiceMessage} />
      {!lastUserMessage ? (
        <WaitingPrompt />
      ) : (
        <WebGLAvatar
          fft={micFft}
          isPlaying={isPlaying}
          prosody={lastVoiceMessage?.models[0].entries ?? []}
          width={400}
          height={200}
        />
      )}
      <Backdrop
        prosody={lastVoiceMessage?.models[0].entries ?? []}
        activeView={VoiceAnimationState.IDLE}
      />
    </>
  );
};
