export const loadAudioWorklet = async (
  ctx: AudioContext,
  attemptNumber = 1,
): Promise<boolean> => {
  return ctx.audioWorklet
    .addModule(
      'https://storage.googleapis.com/evi-react-sdk-assets/audio-worklet-20250507.js',
    )
    .then(() => {
      return true;
    })
    .catch(() => {
      if (attemptNumber >= 10) {
        return false;
      }
      return loadAudioWorklet(ctx, attemptNumber + 1);
    });
};
