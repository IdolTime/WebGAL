import { resetStage } from '@/Core/controller/stage/resetStage';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneParser } from '@/Core/parser/sceneParser';
import { logger } from '../logger';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';

export const syncWithOrigine = (sceneName: string, sentenceId: number) => {
  logger.warn('正在跳转到' + sceneName + ':' + sentenceId);
  const dispatch = webgalStore.dispatch;
  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'isShowLogo', visibility: false }));
  const title = document.getElementById('Title_enter_page');
  if (title) {
    title.style.display = 'none';
  }
  resetStage(true);
  // 重新获取初始场景
  const sceneUrl: string = assetSetter(sceneName, fileType.scene);
  // 场景写入到运行时
  setTimeout(() => {
    sceneFetcher(sceneUrl).then(async (rawScene) => {
      const scene = await WebGAL.sceneManager.setCurrentScene(rawScene, 'start.txt', sceneUrl);
      if (!scene) return;
      // 开始快进到指定语句
      const currentSceneName = WebGAL.sceneManager.sceneData.currentScene.sceneName;
      WebGAL.gameplay.isFast = true;
      WebGAL.gameplay.isSyncingWithOrigine = true;
      syncFast(sentenceId, currentSceneName);
    });
  }, 16);
};

export function syncFast(sentenceId: number, currentSceneName: string) {
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId < sentenceId &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === currentSceneName
  ) {
    nextSentence();
    setTimeout(() => syncFast(sentenceId, currentSceneName), 100);
  } else {
    WebGAL.gameplay.isSyncingWithOrigine = false;
    WebGAL.gameplay.isFast = false;
  }
}
