export async function getAudioUrl(key: string): Promise<string> {
  // 如果不是 .ogg 文件，直接返回原始 URL
  // @ts-ignore
  if (!window.isSafari || !key.toLowerCase().endsWith('.ogg')) {
    return key;
  }

  try {
    // 获取 Ogg 文件的 ArrayBuffer
    const response = await fetch(key);
    const arrayBuffer = await response.arrayBuffer();

    // 解码 Ogg 文件并返回解码后的音频 URL
    const decodedUrl: string = await decodeOgg(arrayBuffer);
    return decodedUrl;
  } catch (error) {
    console.error('Error fetching or decoding Ogg file:', error);
    throw error;
  }
}

function decodeOgg(arrayBuffer: ArrayBuffer) {
  return new Promise<string>((resolve, reject) => {
    let typedArray = new Uint8Array(arrayBuffer);
    let decoderWorker = new Worker('./decoderWorker.js');
    let wavWorker = new Worker('./waveWorker.js');
    let desiredSampleRate = 8000;

    decoderWorker.postMessage({
      command: 'init',
      decoderSampleRate: desiredSampleRate,
      outputBufferSampleRate: desiredSampleRate,
    });

    wavWorker.postMessage({
      command: 'init',
      wavBitDepth: 16,
      wavSampleRate: desiredSampleRate,
    });

    decoderWorker.onmessage = function (e) {
      // null means decoder is finished
      if (e.data === null) {
        wavWorker.postMessage({ command: 'done' });
      }

      // e.data contains decoded buffers as float32 values
      else {
        wavWorker.postMessage(
          {
            command: 'encode',
            buffers: e.data,
          },
          e.data.map(function (typedArray: any) {
            return typedArray.buffer;
          }),
        );
      }
    };

    wavWorker.onmessage = function (e) {
      if (e.data.message === 'page') {
        let dataBlob = new Blob([e.data.page], { type: 'audio/wav' });
        let url = URL.createObjectURL(dataBlob);

        resolve(url);
      }
    };

    decoderWorker.postMessage(
      {
        command: 'decode',
        pages: typedArray,
      },
      [typedArray.buffer],
    );
  });
}
