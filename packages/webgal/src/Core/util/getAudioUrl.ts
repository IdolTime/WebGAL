import { OggVorbisDecoder, OggVorbisDecodedAudio } from '@wasm-audio-decoders/ogg-vorbis';
import { OggOpusDecoder, OggOpusDecodedAudio } from 'ogg-opus-decoder';

export async function getAudioUrl(url: string): Promise<string> {
  // @ts-ignore
  if (!window.isSafari || !url.toLowerCase().endsWith('.ogg')) {
    return url;
  }

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8BufferArray = new Uint8Array(arrayBuffer);

  try {
    // 尝试使用 Opus 解码
    console.log('尝试使用 Opus 解码');
    const audioUrl = await decodeOpus(uint8BufferArray);
    return audioUrl;
  } catch (err) {
    console.log('Opus 解码失败，尝试使用 Vorbis 解码', err);
    // 如果 Opus 解码失败，尝试使用 Vorbis 解码
    try {
      const audioUrl = await decodeVorbis(uint8BufferArray);
      console.log(44444, audioUrl);
      return audioUrl;
    } catch (error) {
      console.error('Vorbis 解码失败，无法获取音频', error);
      return '';
    }
  }
}

async function decodeVorbis(arrayBuffer: Uint8Array): Promise<string> {
  const decoder = new OggVorbisDecoder();
  await decoder.ready;
  const audioData = await decoder.decode(arrayBuffer);
  return createAudioUrl(audioData);
}

async function decodeOpus(arrayBuffer: Uint8Array): Promise<string> {
  const decoder = new OggOpusDecoder();
  await decoder.ready;
  const audioData = await decoder.decode(arrayBuffer);
  return createAudioUrl(audioData);
}

function createAudioUrl(audioData: OggOpusDecodedAudio | OggVorbisDecodedAudio): Promise<string> {
  // @ts-ignore
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = audioContext.createBuffer(
    audioData.channelData.length,
    audioData.samplesDecoded,
    audioData.sampleRate,
  );

  for (let i = 0; i < audioData.channelData.length; i++) {
    buffer.copyToChannel(audioData.channelData[i], i);
  }

  const offlineContext = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const bufferSource = offlineContext.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.connect(offlineContext.destination);
  bufferSource.start();

  return offlineContext.startRendering().then((renderedBuffer) => {
    const wavBuffer = audioBufferToWav(renderedBuffer);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  });
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const wavBuffer = new ArrayBuffer(length);
  const view = new DataView(wavBuffer);
  const channels: Float32Array[] = [];
  let sample: number;
  let offset = 0;
  let pos = 0;

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  return wavBuffer;
}
