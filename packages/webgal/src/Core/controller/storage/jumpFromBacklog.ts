import { logger } from '../../util/logger';
import { sceneFetcher } from '../scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { IStageState } from '@/store/stageInterface';
import { webgalStore } from '@/store/store';
import { initState, removeAllPerform, resetStageState } from '@/store/stageReducer';
import { setVisibility } from '@/store/GUIReducer';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';

import { WebGAL } from '@/Core/WebGAL';
import { sleep } from '@/Core/util/sleep';
import { stopFast } from '../gamePlay/fastSkip';

/**
 * 恢复演出
 */
export const restorePerform = () => {
  const stageState = webgalStore.getState().stage;
  const performListCopy = [...stageState.PerformList];
  webgalStore.dispatch(removeAllPerform());

  performListCopy.forEach((e) => {
    runScript(e.script);
  });
};

/**
 * 从 backlog 跳转至一个先前的状态
 * @param index
 */
export const jumpFromBacklog = async (index: number, refetchScene = true) => {
  stopFast();
  const dispatch = webgalStore.dispatch;
  // 获得存档文件
  const backlogFile = WebGAL.backlogManager.getBacklog()[index];
  logger.debug('读取的backlog数据', backlogFile);
  // 强制停止所有演出
  stopAllPerform();
  WebGAL.resetAnimationManager();
  dispatch(resetStageState(initState));
  WebGAL.gameplay.resetPixiStage();

  // @ts-ignore
  window.pubsub.publish('loading', { loading: true });
  await sleep(500);

  // 重新获取并同步场景状态
  if (refetchScene) {
    sceneFetcher(backlogFile.saveScene.sceneUrl).then(async (rawScene) => {
      const scene = await WebGAL.sceneManager.setCurrentScene(
        rawScene,
        backlogFile.saveScene.sceneName,
        backlogFile.saveScene.sceneUrl,
      );
      // @ts-ignore
      window.pubsub.publish('loading', { loading: false });

      if (scene) {
        // 开始场景的预加载
        const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
        WebGAL.sceneManager.settledScenes.push(WebGAL.sceneManager.sceneData.currentScene.sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
        const subSceneListUniq = uniqWith(subSceneList); // 去重
        scenePrefetcher(subSceneListUniq);
      }
    });
  }
  WebGAL.sceneManager.sceneData.currentSentenceId = backlogFile.saveScene.currentSentenceId;
  WebGAL.sceneManager.sceneData.sceneStack = cloneDeep(backlogFile.saveScene.sceneStack);

  // 弹出backlog项目到指定状态
  for (let i = WebGAL.backlogManager.getBacklog().length - 1; i > index; i--) {
    WebGAL.backlogManager.getBacklog().pop();
  }

  // 要记录本句 Backlog
  WebGAL.backlogManager.isSaveBacklogNext = true;

  // 恢复舞台状态
  const newStageState: IStageState = cloneDeep(backlogFile.currentStageState);

  dispatch(resetStageState(newStageState));

  // 恢复演出
  setTimeout(restorePerform, 0);

  setTimeout(() => {
    // 关闭backlog界面
    dispatch(setVisibility({ component: 'showBacklog', visibility: false }));

    // 重新显示 TextBox
    dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
  }, 32);
};
