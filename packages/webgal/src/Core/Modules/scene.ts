import { IScene, ISceneData, ISentence } from '@/Core/controller/scene/sceneInterface';
import cloneDeep from 'lodash/cloneDeep';
import { sceneParser } from '../parser/sceneParser';
import { commandType } from '@/Core/controller/scene/sceneInterface';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { IUnlockAchieveItem } from '@/store/stageInterface';
import {
  getStorylineFromStorage,
  dumpStorylineToStorage,
  dumpUnlickAchieveToStorage,
  getUnlickAchieveFromStorage,
} from '@/Core/controller/storage/savesController';

export interface ISceneEntry {
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
  continueLine: number; // 继续原场景的行号
}

export enum sceneNameType {
  /** 开始场景 */
  Start = 'start.txt',
  /** 成就场景 */
  Achieve = 'achieve.txt',
  /** 故事线场景 */
  Storyline = 'storyline.txt',
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
    // getUnlickAchieveFromStorage();
    return new Promise((r) => {
      let parsedScene: { current: IScene | null } = { current: null };
      let timer: ReturnType<typeof setTimeout> | null = null;

      if (loading && !this.sceneAssetsLoadedList[scenaName]) {
        timer = setTimeout(() => {
          // @ts-ignore
          window.pubsub.publish('loading', { loading: true });
        }, 1000);
      }

      // @ts-ignore
      const dispose = window.pubsub.subscribe(
        'sceneAssetsLoaded',
        ({ sceneName: _sceneName }: { sceneName: string }) => {
          setTimeout(() => {
            if (scenaName === _sceneName) {
              if (parsedScene.current) {
                this.sceneData.currentScene = parsedScene.current;
              }

              if (loading) {
                // @ts-ignore
                window.pubsub.publish('loading', { loading: false });
              }
              timer && clearTimeout(timer);
              r(parsedScene);
              parsedScene.current = null;
              dispose();
            }
          }, 16);
        },
      );

      const sentenceList = parsedScene.current?.sentenceList || [];

      if (sentenceList.length && scenaName === sceneNameType.Start) {
        // 是否有故事线配置项，如果没有则重置数据
        getStorylineFromStorage().then(() => {
          const unlockStorylineIndex = sentenceList.findIndex(
            (e: ISentence) => e.command === commandType.unlockStoryline,
          );
          if (unlockStorylineIndex === -1) {
            webgalStore.dispatch(saveActions.resetStorylineList());
            dumpStorylineToStorage();
          }
        });

        // 是否有解锁成就配置项，如果没有则重置数据
        const unlockAchieveIndex = sentenceList.findIndex((e: ISentence) => e.command === commandType.unlockAchieve);
        const isSome = this.compareFilenames(scenaName, sceneUrl);
        if (unlockAchieveIndex === -1 && isSome) {
          webgalStore.dispatch(saveActions.resetUnlockAchieveData());
          dumpUnlickAchieveToStorage();
        }
      }

      if (scenaName === sceneNameType.Achieve) {
        this.getAllUnlockAchieveList(sentenceList);
      }

      parsedScene.current = sceneParser(rawScene, scenaName, sceneUrl);
    });
  }

  // 所有解锁成就
  public async getAllUnlockAchieveList(sentenceList: ISentence[]) {
    await getUnlickAchieveFromStorage();
    const unlockAchieveMapper = new Map();
    const timesMapper = new Map();
    webgalStore.getState().saveData.unlockAchieveData.forEach((e) => {
      if (e.isShowUnlock) {
        unlockAchieveMapper.set(e.unlockname, e.isShowUnlock);
        timesMapper.set(e.unlockname, e?.saveTime ?? '');
      }
    });

    // 所有解锁成就
    const allUnlockAchieveList = sentenceList
      .filter((e: ISentence) => e.command === commandType.unlockAchieve)
      .map((e2) => {
        const payload: IUnlockAchieveItem = {
          url: e2?.content ?? '',
          unlockname: '',
          condition: '',
          saveTime: '',
          x: 0,
          y: 0,
          isShowUnlock: false,
        };

        e2.args.forEach((e3) => {
          if (e3.key === 'unlockname') {
            payload['unlockname'] = e3.value.toString();
          } else if (e3.key === 'x') {
            payload['x'] = Number(e3.value);
          } else if (e3.key === 'y') {
            payload['y'] = Number(e3.value);
          } else if (e3.key === 'condition') {
            payload['condition'] = e3.value.toString();
          }
        });

        if (unlockAchieveMapper?.get(payload?.unlockname)) {
          payload['isShowUnlock'] = true;
          payload['saveTime'] = timesMapper?.get(payload?.unlockname);
        }

        return payload;
      });

    webgalStore.dispatch(saveActions.saveAllUnlockAchieveList(allUnlockAchieveList));
    const newList = allUnlockAchieveList.filter((e) => e?.isShowUnlock);
    webgalStore.dispatch(saveActions.setUnlockAchieveData(newList));
    await dumpUnlickAchieveToStorage();
  }

  public compareFilenames(filename1: string, filename2: string) {
    // 提取文件名（不包含路径和后缀名）
    const name1 = filename1.match(/\/?([^/]+)\.\w+$/);
    const name2 = filename2.match(/\/?([^/]+)\.\w+$/);

    if (name1 && name2) {
      return name1[1] === name2[1];
    }

    return false;
  }
}
