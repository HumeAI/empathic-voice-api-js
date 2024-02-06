import { describe, expect, it } from 'vitest';

import { parseTrackEncodingConstraints } from './microphone';

describe('parseTrackEncodingConstraints', () => {
  it('should return default values when no constraints are provided', () => {
    const result = parseTrackEncodingConstraints({}, {});
    expect(result).toEqual({
      sampleRate: 48000,
      channelCount: 1,
    });
  });

  it('should return the minimum value when the ideal value is less than the minimum', () => {
    const result = parseTrackEncodingConstraints(
      { sampleRate: { min: 44100, max: 96000 } },
      { sampleRate: 40000 },
    );
    expect(result.sampleRate).toEqual(44100);
    expect(result.channelCount).toEqual(1);
  });

  it('should return the maximum value when the ideal value is greater than the maximum', () => {
    const result = parseTrackEncodingConstraints(
      { sampleRate: { min: 44100, max: 96000 } },
      { sampleRate: 100000 },
    );
    expect(result.sampleRate).toEqual(96000);
    expect(result.channelCount).toEqual(1);
  });

  it('should return the ideal value when it is within the min and max range', () => {
    const result = parseTrackEncodingConstraints(
      { sampleRate: { min: 44100, max: 96000 } },
      { sampleRate: 50000 },
    );
    expect(result.sampleRate).toEqual(50000);
    expect(result.channelCount).toEqual(1);
  });
});
