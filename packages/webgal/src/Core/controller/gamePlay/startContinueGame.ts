import { assetSetter, fileType } from '../../util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '../scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { saveActions } from '@/store/savesReducer';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { restorePerform } from '@/Core/controller/storage/jumpFromBacklog';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { hasFastSaveRecord, loadFastSaveGame } from '@/Core/controller/storage/fastSaveLoad';
import { WebGAL } from '@/Core/WebGAL';
import { useUILight } from '@/hooks/useUILight';

/**
 * 从头开始游戏
 */
export const startGame = () => {
  resetStage(true, true, false);

  // 重新获取初始场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.setCurrentScene(rawScene, 'start.txt', sceneUrl).then((scene: any) => {
      if (scene) {
        // 开始第一条语句
        nextSentence();
      }
    });
  });

  webgalStore.dispatch(saveActions.setIsShowUnlock(true));
  webgalStore.dispatch(saveActions.setShowStoryline(true));
  webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  // 设置UI亮度
  useUILight(webgalStore.getState().userData.optionData.uiLight)
};

export async function continueGame() {
  /**
   * 重设模糊背景
   */
  setEbg(webgalStore.getState().stage.bgName);
  // 当且仅当游戏未开始时使用快速存档
  // 当游戏开始后 使用原来的逻辑
  if ((await hasFastSaveRecord()) && WebGAL.sceneManager.sceneData.currentSentenceId === 0) {
    // 恢复记录
    await loadFastSaveGame();
    return;
  }
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId === 0 &&
    WebGAL.sceneManager.sceneData.currentScene.sceneName === 'start.txt'
  ) {
    // 如果游戏没有开始，开始游戏
    nextSentence();
  } else {
    restorePerform();
  }
}
