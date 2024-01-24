const DEFAULT_CHANNELS = 1;
const DEFAULT_SAMPLE_RATE = 48000;

type EncodingValues = {
  sampleRate: number;
  channelCount: number;
};

const DEFAULT_ENCODING_VALUES: EncodingValues = {
  sampleRate: DEFAULT_SAMPLE_RATE,
  channelCount: DEFAULT_CHANNELS,
};

/**
 * macbook pro
 * arc -     pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 1 channels, s16, 768 kb/s
 * chrome -  pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 1 channels, s16, 768 kb/s
 * firefox - pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 1 channels, s16, 768 kb/s
 * safari -  pcm_s16le ([1][0][0][0] / 0x0001), 48000 Hz, 2 channels, s16, 1536 kb/s
 */
const getDefaultEncodingByBrowser = (
  browserName: string | undefined,
): EncodingValues => {
  switch (browserName) {
    case 'safari':
      return {
        sampleRate: DEFAULT_SAMPLE_RATE,
        channelCount: 2,
      };
    case 'chrome':
    case 'firefox':
    default:
      return {
        sampleRate: DEFAULT_SAMPLE_RATE,
        channelCount: DEFAULT_CHANNELS,
      };
  }
};

export { getDefaultEncodingByBrowser, DEFAULT_ENCODING_VALUES };
export type { EncodingValues };
