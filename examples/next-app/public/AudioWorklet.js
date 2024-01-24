/**
  An in-place replacement for ScriptProcessorNode using AudioWorklet
*/
class RecorderProcessor extends AudioWorkletProcessor {
  // 0. Determine the buffer size (this is the same as the 1st argument of ScriptProcessor)
  bufferSize = 48000;
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
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet#the_input_and_output_lists
   * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#audio_buffers_frames_samples_and_channels
   */
  process(inputs) {
    const input = inputs[0];
    console.log('channels', input);

    if (input.length != 1) {
      console.log('too many channels', input);
    }

    this.append([input[0], input[1]]);

    return true;
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

    for (let frame = 0; frame < channelData.length; frame++) {
      this.leftBuffer[this._bytesWritten++] = channelData[0][frame];
      this.rightBuffer[this._bytesWritten++] = channelData[1][frame];
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
