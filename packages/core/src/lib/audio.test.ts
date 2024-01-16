import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSupportedMimeType, MimeType } from './audio';

const isTypeSupportedMock = vi.fn();

const MediaRecorderMock = {
  isTypeSupported: isTypeSupportedMock,
};

const SUPPORTED_MIME_TYPES = [
  MimeType.MP4.toString(),
  MimeType.WAV.toString(),
  MimeType.WEBM.toString(),
];

describe('arrayBufferToBlob', () => {
  it.skip('converts array buffer to blob', () => {
    // TODO: Implement
  });
});

describe('getSupportedMimeType', () => {
  beforeEach(() => {
    vi.stubGlobal('MediaRecorder', MediaRecorderMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(SUPPORTED_MIME_TYPES)('returns %s as supported mime type', (mt) => {
    isTypeSupportedMock.mockImplementation((type: string) => {
      if (type === mt) {
        return true;
      }
      return false;
    });

    expect(getSupportedMimeType()).toMatchObject({
      success: true,
      mimeType: mt,
    });
  });

  it('returns error if no mime types are supported', () => {
    isTypeSupportedMock.mockReturnValue(false);

    expect(getSupportedMimeType()).toMatchObject({
      success: false,
      error: new Error('Browser does not support any compatible mime types'),
    });
  });
});
