import { IScene, ISceneData } from '@/Core/controller/scene/sceneInterface';
import cloneDeep from 'lodash/cloneDeep';
import { sceneParser } from '../parser/sceneParser';

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
      r(this.sceneData.currentScene);
    });
  }
}
