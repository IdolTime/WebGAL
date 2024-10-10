import FlvJs from 'flv.js';
// @ts-ignore
import CryptoJS from 'crypto-js';
import { loadingSVGStr } from '@/UI/Components/LoadingSvg';

function arrayBufferToWordArray(arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const words = [];
  for (let i = 0; i < uint8Array.length; i += 4) {
    words.push((uint8Array[i] << 24) | (uint8Array[i + 1] << 16) | (uint8Array[i + 2] << 8) | uint8Array[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(words, uint8Array.length);
}

async function decryptChunk(encryptedChunk: ArrayBuffer, key: CryptoJS.lib.WordArray, iv: CryptoJS.lib.WordArray) {
  const encryptedWordArray = arrayBufferToWordArray(encryptedChunk);
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedWordArray }, key, { iv });

  const decryptedData = new Uint8Array(decrypted.sigBytes);
  for (let i = 0; i < decrypted.sigBytes; i++) {
    decryptedData[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }

  return decryptedData;
}

// eslint-disable-next-line max-params
export async function decryptVideoInChunks(
  encryptedData: ArrayBuffer,
  key: string,
  iv: string,
  type: 'mp4' | 'flv',
  chunkSize = 16 * 1024 * 1024,
) {
  const keyHex = CryptoJS.enc.Hex.parse(key);
  const ivHex = CryptoJS.enc.Hex.parse(iv);

  const totalChunks = Math.ceil(encryptedData.byteLength / chunkSize);
  const decryptedChunks: Uint8Array[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const chunkStart = i * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize, encryptedData.byteLength);
    const encryptedChunk = encryptedData.slice(chunkStart, chunkEnd);

    const decryptedChunk = await decryptChunk(encryptedChunk, keyHex, ivHex);
    decryptedChunks.push(decryptedChunk);
  }

  const totalDecryptedLength = decryptedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const decryptedData = new Uint8Array(totalDecryptedLength);

  let offset = 0;
  for (const chunk of decryptedChunks) {
    decryptedData.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([decryptedData], { type: `video/${type === 'mp4' ? 'mp4' : 'x-flv'}` });
}

// eslint-disable-next-line max-params
export async function decryptVideo(encryptedData: ArrayBuffer, key: Uint8Array, iv: Uint8Array, type: 'mp4' | 'flv') {
  const algorithm = { name: 'AES-CBC', iv: iv };
  const cryptoKey = await crypto.subtle.importKey('raw', key, algorithm, false, ['decrypt']);
  const decryptedData = await crypto.subtle.decrypt(algorithm, cryptoKey, encryptedData);
  return new Blob([new Uint8Array(decryptedData)], { type: `video/${type === 'mp4' ? 'mp4' : 'x-flv'}` });
}

export class VideoManager {
  public videosByKey: Record<
    string,
    {
      player: FlvJs.Player;
      id: string;
      progressTimer: ReturnType<typeof setTimeout> | null;
      waitCommands: {
        showVideo?: boolean;
        playVideo?: boolean;
        setVolume?: number;
        setLoop?: boolean;
        seek?: number;
        destroy?: boolean;
      };
      events: {
        ended: {
          callbacks: (() => void)[];
          handler: () => void;
        };
      };
      poster: string;
    }
  >;
  public idURLMap: Record<string, string> = {};
  public currentPlayingVideo = '';
  private videoIndex = 0;

  public constructor() {
    this.videosByKey = {};
    this.currentPlayingVideo = '';
  }

  public preloadVideo(url: string, playWhenLoaded = false) {
    if (this.videosByKey[url]) {
      // 已经预加载过的video标签不再重复创建
      return;
    }

    console.info('开始预加载视频', url);
    const id = 'video-' + this.videoIndex++; // 生成唯一id
    const videoContainerTag = document.createElement('div');
    const videoTag = document.createElement('video') as HTMLVideoElement;
    const videoType = url.endsWith('.flv') ? 'flv' : 'mp4';
    videoContainerTag.setAttribute('id', id);
    // 隐藏video标签
    videoContainerTag.style.width = '100%';
    videoContainerTag.style.height = '100%';
    videoContainerTag.style.zIndex = '-99';
    videoContainerTag.style.display = 'block';
    videoContainerTag.style.opacity = '0';
    videoContainerTag.style.background = '#000';
    videoContainerTag.style.position = 'absolute';

    videoTag.style.width = '100%';
    videoTag.style.height = '100%';
    videoTag.style.zIndex = '11';
    videoTag.style.position = 'absolute';
    videoTag.style.display = 'block';
    videoTag.playsInline = true;
    videoTag.controls = false;

    videoTag.addEventListener('play', function () {
      videoTag.controls = false;
    });
    videoTag.addEventListener('pause', function () {
      videoTag.controls = false;
    });
    videoTag.volume = 0;
    const onEndedHandler = () => {
      const callbacks = this.videosByKey[url].events.ended.callbacks;
      callbacks.forEach((cb) => cb());
    };

    videoContainerTag.appendChild(videoTag);
    document.getElementById('videoContainer')?.appendChild(videoContainerTag);

    // 视频需要缓冲时触发
    videoTag.addEventListener('waiting', () => {
      const loadingNode = videoContainerTag.querySelector('.video-loading');

      if (!loadingNode) {
        const loading = document.createElement('div');
        loading.className = 'video-loading';
        loading.innerHTML = loadingSVGStr;
        videoContainerTag.appendChild(loading);
      }
    });

    // 视频可以播放时触发
    videoTag.addEventListener('canplay', () => {
      const loadingNode = videoContainerTag.querySelector('.video-loading');
      if (loadingNode) {
        videoContainerTag.removeChild(loadingNode);
      }
    });

    // 视频加载失败时触发
    videoTag.addEventListener('error', () => {
      const loadingNode = videoContainerTag.querySelector('.video-loading');
      if (loadingNode) {
        videoContainerTag.removeChild(loadingNode);
      }

      // 你可以在这里添加更多的错误处理逻辑，比如显示一个错误消息
      const errorNode = document.createElement('div');
      errorNode.className = 'video-error';
      errorNode.textContent = '视频加载失败，请稍后重试。';
      videoContainerTag.appendChild(errorNode);
    });

    this.videosByKey[url] = {
      // @ts-ignore
      player: null,
      id,
      progressTimer: null,
      waitCommands: {},
      events: {
        ended: {
          callbacks: [],
          handler: onEndedHandler,
        },
      },
    };

    if (playWhenLoaded) {
      this.videosByKey[url].waitCommands = {
        playVideo: true,
        showVideo: true,
      };
    }

    fetch(url)
      .then((res) => {
        if (res.status > 200) {
          return null;
        }
        return res.arrayBuffer();
      })
      .then(async (dataBuffer) => {
        if (!dataBuffer) {
          return;
        }

        const marker = 'ENCRYPTED';
        const markerLength = marker.length;
        const signatureArray = new Uint8Array(dataBuffer.slice(0, markerLength));

        let isEncrypted = false;
        for (let i = 0; i < markerLength; i++) {
          if (String.fromCharCode(signatureArray[i]) !== marker[i]) {
            isEncrypted = false;
            break;
          }
          isEncrypted = true;
        }

        let videoBlob;
        if (isEncrypted) {
          const encryptedData = dataBuffer.slice(markerLength);

          if (window.crypto?.subtle) {
            const key = new Uint8Array([
              0x40, 0xe6, 0xad, 0x42, 0x9a, 0x13, 0x02, 0x0a, 0x07, 0xbe, 0x29, 0x0c, 0x5e, 0xf1, 0xd7, 0xdc, 0x7e,
              0x45, 0xe5, 0xc4, 0xbf, 0x34, 0xd5, 0x4a, 0x56, 0x64, 0x28, 0x26, 0x27, 0x94, 0x6e, 0x4d,
            ]);
            const iv = new Uint8Array([
              0x9d, 0x6b, 0xac, 0x74, 0xc6, 0x4e, 0xe8, 0x71, 0x4e, 0x79, 0x59, 0xce, 0xf7, 0x52, 0x71, 0xd0,
            ]);
            videoBlob = await decryptVideo(encryptedData, key, iv, videoType);
          } else {
            const key = '40e6ad429a13020a07be290c5ef1d7dc7e45e5c4bf34d54a5664282627946e4d';
            const iv = '9d6bac74c64ee8714e7959cef75271d0';
            videoBlob = await decryptVideoInChunks(encryptedData, key, iv, videoType);
          }
        } else {
          videoBlob = new Blob([new Uint8Array(dataBuffer)], {
            type: `video/${videoType === 'mp4' ? 'mp4' : 'x-flv'}`,
          });
        }

        const flvPlayer = FlvJs.createPlayer({
          type: url.endsWith('.mp4') ? 'mp4' : 'flv',
          url: URL.createObjectURL(videoBlob),
        });
        flvPlayer.attachMediaElement(videoTag);
        flvPlayer.load();
        const videoKeyItem = {
          ...this.videosByKey[url],
          player: flvPlayer,
        };

        this.videosByKey[url] = videoKeyItem;

        videoTag.onloadeddata = () => {
          const waitCommands = Object.keys(videoKeyItem.waitCommands);

          if (videoKeyItem) {
            const canvas2 = document.createElement('canvas');
            const context = canvas2.getContext('2d');
            canvas2.width = 480;
            canvas2.height = 270;
            context!.drawImage(videoTag, 0, 0, 480, 270);
            const url = canvas2.toDataURL('image/webp', 0.5);
            canvas2.remove();

            videoKeyItem.poster = url;
          }

          if (waitCommands.length) {
            waitCommands.forEach((command) => {
              if (!videoKeyItem) {
                console.log('没有找到视频缓存资源', url);
                return;
              }
              // @ts-ignore
              this[command](url, videoKeyItem.waitCommands[command]);
            });
          }
        };
      });
  }

  public pauseVideo(key: string): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      videoItem.player.pause();
    }
  }

  public showVideo(key: string, keepVideo?: boolean): void {
    const videoItem = this.videosByKey[key];

    if (videoItem?.player) {
      const videoContainerTag = document.getElementById(videoItem.id);

      if (videoContainerTag) {
        videoContainerTag.style.opacity = '1';
        videoContainerTag.style.zIndex = keepVideo ? '6' : '11';
      }
    } else if (!videoItem) {
      this.preloadVideo(key, true);
    } else {
      videoItem.waitCommands.showVideo = true;
    }
  }

  public playVideo(key: string): void {
    const videoItem = this.videosByKey[key];
    this.currentPlayingVideo = key;

    if (videoItem?.player) {
      videoItem.player.play();
      this.checkProgress(key);
    } else if (!videoItem) {
      this.preloadVideo(key, true);
    } else {
      videoItem.waitCommands.playVideo = true;
    }
  }

  public setLoop(key: string, loopValue: boolean): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      const videoTag = document.getElementById(videoItem.id) as HTMLVideoElement;

      if (videoTag) {
        videoTag.loop = loopValue;
      }
    } else {
      videoItem.waitCommands.setLoop = loopValue;
    }
  }

  public seek(key: string, time: number): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      videoItem.player.currentTime = time;
    } else {
      videoItem.waitCommands.seek = time;
    }
  }

  public backward(key: string): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      if (videoItem.player.currentTime > 0) {
        videoItem.player.currentTime -= 1; // 回退一秒
      }
    }
  }

  public forward(key: string): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      videoItem.player.currentTime += 1; // 前进一秒
    }
  }

  public setVolume(key: string, volume: number): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      videoItem.player.volume = volume;
    } else {
      videoItem.waitCommands.setVolume = volume;
    }
  }

  public setUrlIdMap(id: string, url: string) {
    this.idURLMap[id] = url;
  }

  public destroy(key: string, noWait = false, isLoadVideo = false): void {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      videoItem.player.pause();
      videoItem.player.volume = 0;
      const videoContainer = document.getElementById(videoItem.id);

      if (videoContainer) {
        videoContainer.style.opacity = '0';
        videoContainer.style.zIndex = '-99';
      }

      if (videoItem?.progressTimer) {
        clearTimeout(videoItem.progressTimer);
      }

      setTimeout(
        () => {
          try {
            const video = videoContainer?.getElementsByTagName('video');
            if (video?.length) {
              videoItem.player?.destroy();
            }
          } catch (error) {
            console.warn(error);
          }
          setTimeout(
            () => {
              videoContainer?.remove();
            },
            noWait ? 0 : 500,
          );
          delete this.videosByKey[key];
        },
        noWait ? 0 : 2000,
      );
    } else {
      // videoItem.waitCommands.destroy = true;
    }
  }

  public destroyAll(noWait = false): void {
    Object.keys(this.videosByKey).forEach((key) => {
      this.destroy(key, noWait);
    });
  }

  public onEnded(key: string, callback: () => void) {
    const videoItem = this.videosByKey[key];
    videoItem.events.ended.callbacks.push(callback);
  }

  public getDuration(key: string) {
    const videoItem = this.videosByKey[key];
    if (videoItem?.player) {
      return videoItem.player.duration;
    }
  }

  public destroyExcept(keys: string[]) {
    Object.keys(this.videosByKey).forEach((key) => {
      if (!keys.includes(key)) {
        this.destroy(key);
      }
    });
  }

  private checkProgress(key: string) {
    const videoItem = this.videosByKey[key];

    if (videoItem?.player) {
      const player = videoItem.player;
      const currentTime = player.currentTime;
      const duration = player.duration;

      if (duration - currentTime <= 0.03) {
        clearTimeout(videoItem.progressTimer as any);
        videoItem.progressTimer = null;
        videoItem.events.ended.handler();
        return;
      }

      // 每隔一段时间检查一次播放进度
      videoItem.progressTimer = setTimeout(() => {
        this.checkProgress(key);
      }, 100);
    }
  }
}
