import FlvJs from 'flv.js';

// eslint-disable-next-line max-params
async function decryptVideo(encryptedData: ArrayBuffer, key: Uint8Array, iv: Uint8Array, type: 'mp4' | 'flv') {
  const algorithm = { name: 'AES-CBC', iv: iv };
  const cryptoKey = await crypto.subtle.importKey('raw', key, algorithm, false, ['decrypt']);
  const decryptedData = await crypto.subtle.decrypt(algorithm, cryptoKey, encryptedData);
  return new Blob([new Uint8Array(decryptedData)], { type: `video/${type === 'mp4' ? 'mp4' : 'x-flv'}` });
}

export class VideoManager {
  private videosByKey: Record<
    string,
    {
      player: FlvJs.Player;
      id: string;
      progressTimer: ReturnType<typeof setTimeout> | null;
      events: {
        ended: {
          callbacks: (() => void)[];
          handler: () => void;
        };
      };
    }
  >;
  private videoIndex = 0;

  public constructor() {
    this.videosByKey = {};
  }

  public preloadVideo(url: string) {
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
          const key = new Uint8Array([
            0x40, 0xe6, 0xad, 0x42, 0x9a, 0x13, 0x02, 0x0a, 0x07, 0xbe, 0x29, 0x0c, 0x5e, 0xf1, 0xd7, 0xdc, 0x7e, 0x45,
            0xe5, 0xc4, 0xbf, 0x34, 0xd5, 0x4a, 0x56, 0x64, 0x28, 0x26, 0x27, 0x94, 0x6e, 0x4d,
          ]);
          const iv = new Uint8Array([
            0x9d, 0x6b, 0xac, 0x74, 0xc6, 0x4e, 0xe8, 0x71, 0x4e, 0x79, 0x59, 0xce, 0xf7, 0x52, 0x71, 0xd0,
          ]);
          videoBlob = await decryptVideo(encryptedData, key, iv, videoType);
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

        this.videosByKey[url] = {
          player: flvPlayer,
          id,
          progressTimer: null,
          events: {
            ended: {
              callbacks: [],
              handler: onEndedHandler,
            },
          },
        };
      });
  }

  public pauseVideo(key: string): void {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      videoItem.player.pause();
    }
  }

  public showVideo(key: string): void {
    const videoItem = this.videosByKey[key];

    if (videoItem) {
      const videoContainerTag = document.getElementById(videoItem.id);

      if (videoContainerTag) {
        videoContainerTag.style.opacity = '1';
        videoContainerTag.style.zIndex = '11';
      }
    }
  }

  public playVideo(key: string): void {
    const videoItem = this.videosByKey[key];

    if (videoItem) {
      videoItem.player.play();
      this.checkProgress(key);
    }
  }

  public setLoop(key: string, loopValue: boolean): void {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      const videoTag = document.getElementById(videoItem.id) as HTMLVideoElement;

      if (videoTag) {
        videoTag.loop = loopValue;
      }
    }
  }

  public seek(key: string, time: number): void {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      videoItem.player.currentTime = time;
    }
  }

  public setVolume(key: string, volume: number): void {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      videoItem.player.volume = volume;
    }
  }

  public destory(key: string): void {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      videoItem.player.pause();
      videoItem.player.volume = 0;
      const videoContainer = document.getElementById(videoItem.id);

      if (videoContainer) {
        videoContainer.style.opacity = '0';
        videoContainer.style.zIndex = '-99';
      }

      if (videoItem.progressTimer) {
        clearTimeout(videoItem.progressTimer);
      }

      setTimeout(() => {
        try {
          const video = videoContainer?.getElementsByTagName('video');
          if (video?.length) {
            videoItem.player.destroy();
          }
        } catch (error) {
          console.warn(error);
        }
        setTimeout(() => {
          videoContainer?.remove();
        }, 500);
        delete this.videosByKey[key];
      }, 2000);
    }
  }

  public destoryAll(): void {
    Object.keys(this.videosByKey).forEach((key) => {
      this.destory(key);
    });
    this.videosByKey = {}; // 重置视频对象字典
  }

  public onEnded(key: string, callback: () => void) {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      videoItem.events.ended.callbacks.push(callback);
    }
  }

  public getDuration(key: string) {
    const videoItem = this.videosByKey[key];
    if (videoItem) {
      return videoItem.player.duration;
    }
  }

  public destoryExcept(keys: string[]) {
    Object.keys(this.videosByKey).forEach((key) => {
      if (!keys.includes(key)) {
        this.destory(key);
      }
    });
  }

  private checkProgress(key: string) {
    const videoItem = this.videosByKey[key];

    if (videoItem) {
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
