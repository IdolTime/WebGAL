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
  getUnlockAffinityFromStorage,
} from '@/Core/controller/storage/savesController';
import { ISaveStoryLineData, ISaveStoryLine } from '@/store/userDataInterface';

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
  /** 好感度场景 */
  Affinity = 'affinity.txt',
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
              const sentenceList = this.sceneData?.currentScene?.sentenceList ?? [];
              if (scenaName === sceneNameType.Storyline) {
                this.getAllStorylineList(sentenceList);
              } else if (scenaName === sceneNameType.Achieve) {
                this.getAllUnlockAchieveList(sentenceList);
              } else if (scenaName === sceneNameType.Affinity) {
                getUnlockAffinityFromStorage();
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

      parsedScene.current = sceneParser(rawScene, scenaName, sceneUrl);
    });
  }

  // 得到所有解锁故事线数据
  private async getAllStorylineList(sentenceList: ISentence[]) {
    await getStorylineFromStorage();
    const unlockStoryLineeMapper = new Map();
    const videoDataMapper = new Map();

    webgalStore.getState().saveData.unlockStorylineList.forEach((item: ISaveStoryLineData) => {
      const { name, isUnlock = false } = (item.storyLine as ISaveStoryLine) || {};
      unlockStoryLineeMapper.set(name, name);
      videoDataMapper.set(name, item.videoData);
    });

    const allStorylineData: ISaveStoryLineData[] = sentenceList
      .filter((e: ISentence) => e.command === commandType.unlockStoryline)
      .map((e2) => {
        const storyLine: ISaveStoryLine = {
          thumbnailUrl: e2?.content ?? '',
          name: '',
          x: 0,
          y: 0,
          isUnlock: false,
          isHideName: false,
        };
        const payload: ISaveStoryLineData = {
          storyLine: {} as unknown as ISaveStoryLine,
          videoData: null,
        };

        e2.args.forEach((e3) => {
          if (e3.key === 'name') {
            storyLine['name'] = e3.value.toString();
          } else if (e3.key === 'x') {
            storyLine['x'] = Number(e3.value);
          } else if (e3.key === 'y') {
            storyLine['y'] = Number(e3.value);
          } else if (e3.key === 'hideName') {
            storyLine['isHideName'] = e3.value.toString() === 'true';
          }
        });

        if (unlockStoryLineeMapper.get(storyLine['name']) && videoDataMapper.get(storyLine['name'])) {
          storyLine['isUnlock'] = true;
          payload['videoData'] = videoDataMapper.get(storyLine['name']);
        } else {
          storyLine['isUnlock'] = false;
        }
        payload['storyLine'] = storyLine;
        return payload;
      });

    // @ts-ignore
    webgalStore.dispatch(saveActions.saveAllStorylineData(allStorylineData));

    const newList = allStorylineData.filter((e) => e.storyLine.isUnlock);
    webgalStore.dispatch(saveActions.setStorylineListFromStorage(newList));
    await dumpStorylineToStorage();
  }

  // 所有解锁成就
  private async getAllUnlockAchieveList(sentenceList: ISentence[]) {
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

  private compareFilenames(filename1: string, filename2: string) {
    // 提取文件名（不包含路径和后缀名）
    const name1 = filename1.match(/\/?([^/]+)\.\w+$/);
    const name2 = filename2.match(/\/?([^/]+)\.\w+$/);

    if (name1 && name2) {
      return name1[1] === name2[1];
    }

    return false;
  }
}
