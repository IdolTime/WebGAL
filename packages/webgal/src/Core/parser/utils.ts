import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { Style, CollectionImages, contentListItem, CollectionVideos } from '../UIConfigTypes';
import { CSSProperties } from 'react';
import { isEmpty } from 'lodash';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { WebGAL } from '@/Core/WebGAL';
import { sceneNameType } from '../Modules/scene';

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
export type ScriptFunction = (sentence: ISentence) => IPerform;

export interface ScriptConfig {
  scriptType: commandType;
  scriptFunction: ScriptFunction;
  next?: boolean;
}

export interface IConfigInterface extends ScriptConfig {
  scriptString: string;
}

export function ScriptConfig(
  scriptType: commandType,
  scriptFunction: ScriptFunction,
  config?: Omit<ScriptConfig, 'scriptType' | 'scriptFunction'>,
): ScriptConfig {
  return { scriptType, scriptFunction, ...config };
}

export const scriptRegistry: Record<commandType, IConfigInterface> = {} as any;

export function defineScripts<R extends Record<string, Omit<IConfigInterface, 'scriptString'>>>(
  record: R,
): {
  [K in keyof R]: IConfigInterface;
} {
  // eslint-disable-next-line
  const result = {} as Record<keyof R, IConfigInterface>;
  for (const [scriptString, config] of Object.entries(record)) {
    result[scriptString as keyof R] = scriptRegistry[config.scriptType] = { scriptString, ...config };
  }
  return result;
}

export const px2 = (value: number | string) => (typeof value === 'string' ? Number(value) : value) / 0.5;

// 解析样式的工具函数
export function parseStyleArg(styleObj?: Style): CSSProperties {
  const style: CSSProperties = {};

  if (styleObj) {
    if (styleObj.x !== undefined) {
      style.left = px2(styleObj.x) + 'px';
      style.position = 'absolute';
      // style.transform = 'translateX(-50%)';
    }
    if (styleObj.y !== undefined) {
      style.top = px2(styleObj.y) + 'px';
      style.position = 'absolute';
      // style.transform += ' translateY(-50%)';
    }
    if (styleObj.scale !== undefined) {
      if (style.transform) {
        style.transform += ` scale(${styleObj.scale})`;
      } else {
        style.transform = `scale(${styleObj.scale})`;
      }
    }
    if (styleObj.fontSize !== undefined) {
      style.fontSize = px2(styleObj.fontSize) + 'px';
    }
    if (styleObj.fontColor !== undefined) {
      style.color = styleObj.fontColor;
    }
    if (styleObj.width !== undefined) {
      style.width = px2(styleObj.width) + 'px';
    }
    if (styleObj.height !== undefined) {
      style.height = px2(styleObj.height) + 'px';
    }
    if (styleObj.marginLeft !== undefined) {
      style.marginLeft = px2(styleObj.marginLeft) + 'px';
    }
    if (styleObj.marginRight !== undefined) {
      style.marginRight = px2(styleObj.marginRight) + 'px';
    }
    if (styleObj.marginTop !== undefined) {
      style.marginTop = px2(styleObj.marginTop) + 'px';
    }
    if (styleObj.marginBottom !== undefined) {
      style.marginBottom = px2(styleObj.marginBottom) + 'px';
    }
    if (styleObj.gap !== undefined) {
      style.gap = px2(styleObj.gap) + 'px';
    }
    if (styleObj.rowGap !== undefined) {
      style.rowGap = px2(styleObj.rowGap) + 'px';
    }
    if (styleObj.columnGap !== undefined) {
      style.columnGap = px2(styleObj.columnGap) + 'px';
    }
    if (styleObj.position) {
      style.position = styleObj.position;
    }
    if (styleObj.alignPosition !== undefined) {
      if (styleObj.alignPosition === 'top-center') {
        style.top = '0';
      } else if (styleObj.alignPosition === 'bottom-center') {
        style.top = 'auto';
        style.bottom = '0';
      }
    }
    if (styleObj.fontColor === undefined && styleObj.customColor !== undefined) {
      style.color = styleObj.customColor;
    }
    if (styleObj.fontColor === undefined && styleObj.customFontSize !== undefined) {
      style.fontSize = px2(styleObj.customFontSize) + 'px';
    }
  }

  return style;
}

export function parseImagesArg(imgs?: CollectionImages): contentListItem[] {
  if (!imgs || isEmpty(imgs)) {
    return [];
  }
  const imgList: contentListItem[] = [];
  Object.keys(imgs).forEach((key) => {
    // @ts-ignore
    const src = imgs[key] as string;
    imgList.push({
      key,
      type: 'image',
      url: assetSetter(src, fileType.ui) as string,
    });
  });

  return imgList;
}

export function isInGame(): boolean {
  const currentScene = WebGAL.sceneManager.sceneData.currentScene?.sceneName;
  const configScenes: Record<string, 1> = {
    [sceneNameType.Affinity]: 1,
    [sceneNameType.Achieve]: 1,
    [sceneNameType.Storyline]: 1,
    'config.txt': 1,
  };

  if (!currentScene || configScenes[currentScene]) {
    return false;
  }

  return true;
}

const loadAssetWithRealTimeSpeed = (
  url: string,
  retries: number,
  initialDelay: number,
  onSuccess: () => void,
  onError: () => void,
  onProgress: (downloaded: number, total: number, speed: number) => void,
  // eslint-disable-next-line max-params
) => {
  const attemptLoad = (retryCount: number, delay: number) => {
    const startTime = Date.now();
    let lastUpdateTime = startTime;
    let receivedLength = 0;
    let totalLength = 0;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${url}`);
        }
        const contentLength = response.headers.get('content-length');
        totalLength = contentLength ? parseInt(contentLength, 10) : 0;
        return response.body?.getReader();
      })
      .then((reader) => {
        const updateInterval = 1000; // 每秒更新一次速度
        const intervalId = setInterval(() => {
          const now = Date.now();
          const timeElapsed = (now - lastUpdateTime) / 1000;
          const currentSpeed = receivedLength / timeElapsed / 1024; // KB/s

          onProgress(receivedLength, totalLength, currentSpeed);

          lastUpdateTime = now;
        }, updateInterval);

        const read = () => {
          reader
            ?.read()
            .then(({ done, value }) => {
              if (done) {
                clearInterval(intervalId); // 清除定时器
                onSuccess(); // 下载完成
                return;
              }

              if (value) {
                receivedLength += value.length;
              }

              read(); // 继续读取流数据
            })
            .catch(() => {
              clearInterval(intervalId); // 清除定时器
              if (retryCount > 0) {
                console.log(`Retrying: ${url}, attempts left: ${retryCount}`);
                setTimeout(() => {
                  attemptLoad(retryCount - 1, delay * 2);
                }, delay);
              } else {
                onError(); // 下载失败
              }
            });
        };
        read();
      })
      .catch(() => {
        if (retryCount > 0) {
          setTimeout(() => {
            attemptLoad(retryCount - 1, delay * 2);
          }, delay);
        } else {
          onError();
        }
      });
  };

  attemptLoad(retries, initialDelay);
};
export function parseVideosArg(videos?: CollectionVideos): contentListItem[] {
  if (!videos || isEmpty(videos)) {
    return [];
  }

  const videoList: contentListItem[] = [];
  Object.keys(videos).forEach((key) => {
    // @ts-ignore
    const src = videos[key] as string;
    videoList.push({
      key,
      type: 'video',
      url: assetSetter(src, fileType.video) as string,
    });
  });
  return videoList;
}

// 创建动态光标的CSS动画
export function createCursorAnimation(cursor: { imgs: string[]; interval: number }, type: 'normal' | 'active') {
  const styleSheet = document.createElement('style');
  let keyframes = `
    @keyframes ${type === 'normal' ? '' : 'active-'}cursor-animation {
  `;

  if (!cursor.imgs || cursor.imgs.length === 0) {
    return;
  }

  cursor.imgs.forEach((_img, index) => {
    const img = assetSetter(_img, fileType.ui);
    const percentage = (index / cursor.imgs.length) * 100;
    keyframes += `
      ${percentage}% { cursor: url(${img}), pointer; }
    `;
  });

  keyframes += `
    100% { cursor: url(${assetSetter(cursor.imgs[0], fileType.ui)}), pointer; }
    }
  `;

  const styleArr = [keyframes];

  if (!isMobile()) {
    if (type === 'normal') {
      styleArr.push(
        `#root { animation: cursor-animation ${cursor.interval * cursor.imgs.length}ms infinite steps(${
          cursor.imgs.length
        }); }`,
      );
    } else {
      styleArr.push(
        `.interactive { animation: active-cursor-animation ${cursor.interval * cursor.imgs.length}ms infinite steps(${
          cursor.imgs.length
        }); }`,
      );
    }
  }

  styleSheet.innerHTML = styleArr.join('\n');

  document.head.appendChild(styleSheet);
}


function isMobile() {
  return navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  );
}

