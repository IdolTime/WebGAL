import { sceneFetcher } from './sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { logger } from '../../util/logger';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 切换场景
 * @param sceneUrl 场景路径
 * @param sceneName 场景名称
 */
export const changeScene = (sceneUrl: string, sceneName: string) => {
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then(async (rawScene) => {
    const scene = await WebGAL.sceneManager.setCurrentScene(rawScene, sceneName, sceneUrl, true);
    if (scene) {
      WebGAL.sceneManager.sceneData.currentSentenceId = 0;
      const currentSceneVideos: string[] = [];

      WebGAL.sceneManager.sceneData.currentScene.assetsList.forEach((x) => {
        if (x.url.endsWith('.mp4') || x.url.endsWith('.flv')) {
          currentSceneVideos.push(x.url);
        }
      });
      WebGAL.videoManager.destoryExcept(currentSceneVideos);

      // 开始场景的预加载
      const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
      WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
      const subSceneListUniq = uniqWith(subSceneList); // 去重
      scenePrefetcher(subSceneListUniq);
      logger.debug('现在切换场景，切换后的结果：', WebGAL.sceneManager.sceneData);
      nextSentence();
    }
  });
};
