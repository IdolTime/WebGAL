import { IAsset } from '@/Core/controller/scene/sceneInterface';
import { logger } from '../logger';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 预加载函数
 * @param assetList 场景资源列表
 */
export const assetsPrefetcher = (assetList: Array<IAsset>, sceneName: string) => {
  WebGAL.sceneManager.sceneAssetsList[sceneName] = assetList.reduce((p, c) => {
    p[c.url] = false;
    return p;
  }, {} as any);
  for (const asset of assetList) {
    // 判断是否已经存在
    const hasHandled = !!WebGAL.sceneManager.settledAssets.find((settledAssetUrl) => {
      if (settledAssetUrl === asset.url) {
        return true;
      }
      return false;
    });
    const assetsLoadedObject = WebGAL.sceneManager.sceneAssetsList[sceneName];

    if (hasHandled) {
      assetsLoadedObject[asset.url] = true;
      checkIfAllSceneAssetsAreSettled(sceneName);
      logger.warn('该资源已在预加载列表中，无需重复加载');
    } else {
      console.log('预加载资源：', asset.url);
      if (asset.url.endsWith('.mp4') || asset.url.endsWith('.flv')) {
        assetsLoadedObject[asset.url] = true;
        checkIfAllSceneAssetsAreSettled(sceneName);
        WebGAL.videoManager.preloadVideo(asset.url);
      } else {
        const newLink = document.createElement('link');
        newLink.setAttribute('rel', 'prefetch');
        newLink.setAttribute('href', asset.url);
        const head = document.getElementsByTagName('head');
        if (head.length) {
          head[0].appendChild(newLink);
        }
        newLink.onload = () => {
          assetsLoadedObject[asset.url] = true;
          checkIfAllSceneAssetsAreSettled(sceneName);
        };
        newLink.onerror = () => {
          assetsLoadedObject[asset.url] = true;
          checkIfAllSceneAssetsAreSettled(sceneName);
          const index = WebGAL.sceneManager.settledAssets.findIndex((settledAssetUrl, index) => {
            if (settledAssetUrl === asset.url) {
              return true;
            }
            return false;
          });
          if (index > -1) {
            WebGAL.sceneManager.settledAssets.splice(index, 1);
          }
        };
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
  const allSettled = Object.values(assetsLoadedObject).every((x) => x);

  if (allSettled) {
    WebGAL.sceneManager.sceneAssetsLoadedList[sceneName] = true;
    // @ts-ignore
    window.pubsub.publish('sceneAssetsLoaded', { sceneName });
  }
};
