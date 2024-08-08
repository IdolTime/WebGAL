import { ISaveData } from '@/store/userDataInterface';
import { logger } from '../../util/logger';
import { sceneFetcher } from '../scene/sceneFetcher';
import { webgalStore } from '@/store/store';
import { resetStageState } from '@/store/stageReducer';
import { setVisibility } from '@/store/GUIReducer';
import { restorePerform } from './jumpFromBacklog';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { WebGAL } from '@/Core/WebGAL';
import { saveActions } from '@/store/savesReducer';

/**
 * 读取游戏存档
 * @param index 要读取的存档的档位
 * @param isLoadVideo 是否加载视频
 */
export const loadGame = (index: number, isLoadVideo = false) => {
  const userDataState = webgalStore.getState().saveData;
  // 获得存档文件
  const loadFile: ISaveData = userDataState.saveData[index];
  logger.debug('读取的存档数据', loadFile);
  // 加载存档
  loadGameFromStageData(loadFile, isLoadVideo);
};

export async function loadGameFromStageData(stageData: ISaveData, isLoadVideo = false) {
  if (!stageData) {
    logger.info('暂无存档');
    return;
  }
  const loadFile = stageData;

  // 重新获取并同步场景状态
  try {
    const rawScene = await sceneFetcher(loadFile.sceneData.sceneUrl);
    const scene = await WebGAL.sceneManager.setCurrentScene(
      rawScene,
      loadFile.sceneData.sceneName,
      loadFile.sceneData.sceneUrl,
      true,
    );

    // 设置背景
    if (!scene) return;

    // 开始场景的预加载
    const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
    WebGAL.sceneManager.settledScenes.push(WebGAL.sceneManager.sceneData.currentScene.sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);
  } catch (error) {
    logger.error('场景加载失败', error);
    return;
  }

  WebGAL.sceneManager.sceneData.currentSentenceId = loadFile.sceneData.currentSentenceId;
  WebGAL.sceneManager.sceneData.sceneStack = cloneDeep(loadFile.sceneData.sceneStack);

  // 强制停止所有演出
  stopAllPerform();

  // 恢复backlog
  const newBacklog = loadFile.backlog;
  WebGAL.backlogManager.getBacklog().splice(0, WebGAL.backlogManager.getBacklog().length); // 清空原backlog
  for (const e of newBacklog) {
    WebGAL.backlogManager.getBacklog().push(e);
  }

  // 恢复舞台状态
  const newStageState = cloneDeep(loadFile.nowStageState);
  const dispatch = webgalStore.dispatch;
  dispatch(resetStageState(newStageState));

  // 播放视频
  if (isLoadVideo) {
    dispatch(saveActions.setLoadVideo(true));
    loadFile.nowStageState.PerformList.forEach((e) => {
      runScript(e.script);
    });
  } else {
    // 恢复演出
    setTimeout(restorePerform, 0);
  }

  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  dispatch(setVisibility({ component: 'showExtra', visibility: false }));

  /**
   * 恢复模糊背景
   */
  setEbg(webgalStore.getState().stage.bgName);
}

