import { detect } from 'detect-browser';

import type { EncodingValues } from './constants';
import {
  DEFAULT_ENCODING_VALUES,
  getDefaultEncodingByBrowser,
} from './constants';

const parseTrackEncodingConstraints = (
  trackCapabilities: MediaTrackCapabilities,
  encodingConstraints: Partial<EncodingValues>,
  browserName?: string,
): EncodingValues => {
  const supportedConstraints: Partial<EncodingValues> = {};

  for (const key of Object.keys(encodingConstraints)) {
    if (key in trackCapabilities) {
      const { min, max } = trackCapabilities[
        key as keyof MediaTrackCapabilities
      ] as ULongRange;
      const idealValue = encodingConstraints[key as keyof EncodingValues];
      if (idealValue) {
        if (min && idealValue < min) {
          console.warn(
            `constraint ${key} ${idealValue} is not supported by the ${
              browserName ?? 'this browser'
            } (minimum ${min}). Using ${min} instead.`,
          );
          supportedConstraints[key as keyof EncodingValues] = min;
        } else if (max && idealValue > max) {
          console.warn(
            `constraint ${key} ${idealValue} is not supported by the ${
              browserName ?? 'this browser'
            } (maximum ${max}). Using ${max} instead.`,
          );
          supportedConstraints[key as keyof EncodingValues] = max;
        } else {
          supportedConstraints[key as keyof EncodingValues] = idealValue;
        }
      }
    }
  }

  for (const key of Object.keys(DEFAULT_ENCODING_VALUES)) {
    if (!(key in trackCapabilities)) {
      console.warn(
        `${
          browserName ?? 'this browser'
        } does not support configuring ${key}. Using default value ${
          getDefaultEncodingByBrowser(browserName)[key as keyof EncodingValues]
        } instead.`,
      );
    }
  }

  return {
    ...getDefaultEncodingByBrowser(browserName),
    ...supportedConstraints,
  };
};

const getStreamSettings = (
  stream: MediaStream,
  encodingConstraints: Partial<typeof DEFAULT_ENCODING_VALUES>,
): EncodingValues => {
  const tracks = stream.getAudioTracks();

  if (tracks.length === 0) {
    throw new Error('No audio tracks');
  }
  if (tracks.length > 1) {
    throw new Error('Multiple audio tracks');
  }
  const track = tracks[0];
  if (!track) {
    throw new Error('No audio track');
  }

  const browserInfo = detect();
  if (!browserInfo) {
    console.warn(
      'No browser info available, cannot fallback to browser-specific defaults.',
    );
    return DEFAULT_ENCODING_VALUES;
  } else {
    const { name: browserName } = browserInfo || {};

    if (browserName === 'firefox') {
      // Firefox does not support getCapabilities() yet
      return getDefaultEncodingByBrowser(browserName);
    }

    const supportedConstraints = parseTrackEncodingConstraints(
      track.getCapabilities(),
      encodingConstraints,
      browserName,
    );

    return supportedConstraints;
  }
};

export { getStreamSettings, parseTrackEncodingConstraints };
