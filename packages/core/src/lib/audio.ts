export enum Channels {
  /** Mono */
  MONO = 1,
  /** Stereo */
  STEREO = 2,
}

export enum AudioEncoding {
  /** 16-bit signed little-endian (PCM) */
  LINEAR16 = 'linear16',
  /** Ogg Opus */
  OPUS = 'opus',
}

export enum MimeType {
  WEBM = 'audio/webm',
  MP4 = 'audio/mp4',
  WAV = 'audio/wav',
}

export function arrayBufferToBlob(arrayBuffer: ArrayBuffer, mimeType?: string) {
  return new Blob([arrayBuffer], { type: mimeType });
}

export function getSupportedMimeType():
  | { success: true; mimeType: MimeType }
  | { success: false; error: Error } {
  if (typeof MediaRecorder === 'undefined') {
    return {
      success: false,
      error: new Error('MediaRecorder is not supported'),
    };
  }
  if (MediaRecorder.isTypeSupported(MimeType.WEBM)) {
    return { success: true, mimeType: MimeType.WEBM };
  }
  if (MediaRecorder.isTypeSupported(MimeType.MP4)) {
    return { success: true, mimeType: MimeType.MP4 };
  }
  if (MediaRecorder.isTypeSupported(MimeType.WAV)) {
    return { success: true, mimeType: MimeType.WAV };
  }
  return {
    success: false,
    error: new Error('Browser does not support any compatible mime types'),
  };
}
