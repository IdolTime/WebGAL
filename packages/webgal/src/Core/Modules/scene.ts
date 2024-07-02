import { IScene, ISceneData, ISentence } from '@/Core/controller/scene/sceneInterface';
import cloneDeep from 'lodash/cloneDeep';
import { sceneParser } from '../parser/sceneParser';
import { commandType } from '@/Core/controller/scene/sceneInterface';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer'
import { dumpStorylineToStorage, dumpUnlickAchieveToStorage } from '@/Core/controller/storage/savesController';

export interface ISceneEntry {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  continueLine: number; // 继续原场景的行号
}

/**
 * 初始化场景数据
 */
export const initSceneData = {
  currentSentenceId: 0, // 当前语句ID
  sceneStack: [],
  // 初始场景，没有数据
  currentScene: {
    sceneName: '', // 场景名称
    sceneUrl: '', // 场景url
    sentenceList: [], // 语句列表
    assetsList: [], // 资源列表
    subSceneList: [], // 子场景列表
  },
};

export class SceneManager {
  public settledScenes: Array<string> = [];
  public settledAssets: Array<string> = [];
  public sceneData: ISceneData = cloneDeep(initSceneData);
  public sceneAssetsList: Record<string, Record<string, 'success' | 'error' | 'loading'>> = {};
  public sceneAssetsLoadedList: Record<string, boolean> = {};

  public resetScene() {
    this.sceneData.currentSentenceId = 0;
    this.sceneData.sceneStack = [];
    this.sceneData.currentScene = cloneDeep(initSceneData.currentScene);
  }

  // eslint-disable-next-line max-params
  public setCurrentScene(rawScene: string, scenaName: string, sceneUrl: string, loading = false) {
    return new Promise((r) => {      
      this.sceneData.currentScene = sceneParser(rawScene, scenaName, sceneUrl);
      const sentenceList = this.sceneData.currentScene.sentenceList;
      if (sentenceList?.length && scenaName === 'start.txt') {
        // 是否有故事线配置项，如果没有则重置数据
        const unlockStorylineIndex = sentenceList.findIndex((e: ISentence) => e.command === commandType.unlockStoryline);
        if (unlockStorylineIndex === -1) {
          webgalStore.dispatch(saveActions.resetStorylineList());
          dumpStorylineToStorage()
        }

        // 是否有成就配置项，如果没有则重置数据
        const unlockAchieveIndex = sentenceList.findIndex((e: ISentence) => e.command === commandType.unlockAchieve);
        if (unlockAchieveIndex === -1) {
          webgalStore.dispatch(saveActions.resetUnlockAchieveData());
          dumpUnlickAchieveToStorage()
        }
      }

      r(this.sceneData.currentScene);
    });
  }
}
