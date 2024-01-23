/**
  An in-place replacement for ScriptProcessorNode using AudioWorklet
*/
class RecorderProcessor extends AudioWorkletProcessor {
  // 0. Determine the buffer size (this is the same as the 1st argument of ScriptProcessor)
  bufferSize = 4096;
  // 1. Track the current buffer fill level
  _bytesWritten = 0;

  // 2. Create a buffer of fixed size
  // _buffer = new Float32Array(this.bufferSize);
  leftBuffer = new Float32Array(this.bufferSize);
  rightBuffer = new Float32Array(this.bufferSize);

  constructor() {
    super();
    this.initBuffer();
  }

  initBuffer() {
    this._bytesWritten = 0;
  }

  isBufferEmpty() {
    return this._bytesWritten === 0;
  }

  isBufferFull() {
    return this._bytesWritten === this.bufferSize;
  }

  /**
   * @param {Float32Array[][]} inputs
   * @returns {boolean}
   *
   * An array of inputs connected to the node, each item of which is,
   * in turn, an array of channels. Each channel is a Float32Array containing
   * 128 samples. For example, inputs[n][m][i] will access n-th input, m-th
   * channel of that input, and i-th sample of that frame (128 frames per frame).
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#audio_buffers_frames_samples_and_channels
   */
  process(inputs) {
    console.log('inputs', inputs);
    // Grabbing the first input, then the first and second channels
    this.append([
      this.float32ToLinear16PCM(inputs[0][0]),
      this.float32ToLinear16PCM(inputs[0][1]),
    ]);

    return true;
  }

  float32ToLinear16PCM(input) {
    let output = new Int16Array(input.length);

    for (let i = 0; i < input.length; i++) {
      // Clipping the float
      let s = Math.max(-1, Math.min(1, input[i]));
      // Scaling to 16-bit and converting to integer
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return output;
  }

  /**
   *
   * @param {Float32Array[]} channelData
   */
  append(channelData) {
    if (this.isBufferFull()) {
      this.flush();
    }

    if (!channelData) return;

    for (let i = 0; i < channelData.length; i++) {
      this.leftBuffer[this._bytesWritten++] = channelData[0][i];
      this.rightBuffer[this._bytesWritten++] = channelData[1][i];
    }
  }

  flush() {
    // trim the buffer if ended prematurely
    this.port.postMessage(
      this._bytesWritten < this.bufferSize
        ? [
            this.leftBuffer.slice(0, this._bytesWritten),
            this.rightBuffer.slice(0, this._bytesWritten),
          ]
        : [this.leftBuffer, this.rightBuffer],
    );
    this.initBuffer();
  }
}

registerProcessor('recorder.worklet', RecorderProcessor);
