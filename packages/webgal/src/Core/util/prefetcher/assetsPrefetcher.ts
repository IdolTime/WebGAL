import { IAsset } from '@/Core/controller/scene/sceneInterface';
import { logger } from '../logger';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>, sceneName: string) => {
  if (
    !WebGAL.sceneManager.sceneAssetsList[sceneName] ||
    !Object.values(WebGAL.sceneManager.sceneAssetsList[sceneName]).length
  ) {
    WebGAL.sceneManager.sceneAssetsList[sceneName] = assetList.reduce((p, c) => {
      p[c.url] = '';
      return p;
    }, {} as any);
  }

  for (const asset of assetList) {
    const assetsLoadedObject = WebGAL.sceneManager.sceneAssetsList[sceneName];

    if (assetsLoadedObject[asset.url] === 'success' || assetsLoadedObject[asset.url] === 'loading') {
      checkIfAllSceneAssetsAreSettled(sceneName);
      logger.warn('该资源已在预加载列表中，无需重复加载');
    } else {
      console.log('预加载资源：', asset.url);
      if (asset.url.endsWith('.mp4') || asset.url.endsWith('.flv')) {
        assetsLoadedObject[asset.url] = 'success';
        checkIfAllSceneAssetsAreSettled(sceneName);
        WebGAL.videoManager.preloadVideo(asset.url);
      } else {
        assetsLoadedObject[asset.url] = 'loading';
        loadAssetWithRetry(
          asset.url,
          3,
          1000,
          () => {
            assetsLoadedObject[asset.url] = 'success';
            checkIfAllSceneAssetsAreSettled(sceneName);
          },
          () => {
            assetsLoadedObject[asset.url] = 'error';
            checkIfAllSceneAssetsAreSettled(sceneName);
            const index = WebGAL.sceneManager.settledAssets.findIndex(
              (settledAssetUrl) => settledAssetUrl === asset.url,
            );
            if (index > -1) {
              WebGAL.sceneManager.settledAssets.splice(index, 1);
            }
          },
        );
        WebGAL.sceneManager.settledAssets.push(asset.url);
      }
    }
  }
  if (assetList.length === 0) {
    checkIfAllSceneAssetsAreSettled(sceneName);
  }
};

const checkIfAllSceneAssetsAreSettled = (sceneName: string) => {
  const assetsLoadedObject = WebGAL.sceneManager.sceneAssetsList[sceneName];
  const allSettled = Object.values(assetsLoadedObject).every((x) => x === 'error' || x === 'success');

  WebGAL.sceneManager.sceneAssetsLoadedList[sceneName] = Object.values(assetsLoadedObject).every(
    (x) => x === 'success',
  );

  if (allSettled) {
    // @ts-ignore
    window.pubsub.publish('sceneAssetsLoaded', { sceneName });
  }
};

const loadAssetWithRetry = (
  url: string,
  retries: number,
  initialDelay: number,
  onSuccess: () => void,
  onError: () => void,
  // eslint-disable-next-line max-params
) => {
  const attemptLoad = (retryCount: number, delay: number) => {
    const onloadCallback = () => {
      onSuccess();
    };
    const onerrorCallback = () => {
      if (retryCount > 0) {
        console.log(`重试加载资源：${url}，剩余次数：${retryCount}，延迟时间：${delay}ms`);
        setTimeout(() => {
          attemptLoad(retryCount - 1, delay * 2);
        }, delay);
      } else {
        onError();
      }
    };

    const newLink = document.createElement('link');

    // @ts-ignore
    if (window.isSafari) {
      fetch(url)
        // @ts-ignore
        .then((res) => {
          if (!res.ok) {
            throw new Error('Error!');
          }

          const ext = url.split('.').pop() || '';
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
          const videoExtensions = ['mp4', 'webm', 'ogg', 'flv'];
          const audioExtensions = ['wav', 'mp3', 'ogg'];

          if (imageExtensions.includes(ext)) {
            return res.blob();
          } else if (audioExtensions.includes(ext) || videoExtensions.includes(ext)) {
            return res.arrayBuffer();
          }

          return res.blob();
        })
        .then(onloadCallback)
        .catch(onerrorCallback);
    } else {
      const newLink = document.createElement('link');
      newLink.setAttribute('rel', 'prefetch');
      newLink.setAttribute('href', url);
      const head = document.getElementsByTagName('head');
      newLink.onload = onloadCallback;
      newLink.onerror = onerrorCallback;
      if (head.length) {
        head[0].appendChild(newLink);
      }
    }
  };

  attemptLoad(retries, initialDelay);
};
