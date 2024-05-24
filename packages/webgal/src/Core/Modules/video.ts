import FlvJs from 'flv.js';

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
    const videoTag = document.createElement('video');
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
    videoTag.volume = 0;
    const onEndedHandler = () => {
      const callbacks = this.videosByKey[url].events.ended.callbacks;
      callbacks.forEach((cb) => cb());
    };

    videoContainerTag.appendChild(videoTag);
    document.getElementById('videoContainer')?.appendChild(videoContainerTag);

    const flvPlayer = FlvJs.createPlayer({
      type: url.endsWith('.mp4') ? 'mp4' : 'flv',
      url,
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
