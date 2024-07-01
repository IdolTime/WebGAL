import { logger } from '../../util/logger';
import { ISaveData, ISaveVideoData } from '@/store/userDataInterface';
import { dumpToStorageFast } from './storageController';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/Core/WebGAL';
import { saveActions } from '@/store/savesReducer';
import { dumpSavesToStorage } from '@/Core/controller/storage/savesController';

/**
 * 保存游戏
 * @param index 游戏的档位
 */
export const saveGame = (index: number, newName?: string) => {
  const saveData: ISaveData = generateCurrentStageData(index, true, newName);
  webgalStore.dispatch(saveActions.saveGame({ index, saveData }));
  dumpSavesToStorage(index, index);
};

/**
 * 生成现在游戏的数据快照
 * @param index 游戏的档位
 */
export function generateCurrentStageData(index: number, isSavePreviewImage = true, newName?: string) {
  const stageState = webgalStore.getState().stage;
  const saveBacklog = cloneDeep(WebGAL.backlogManager.getBacklog());

  /**
   * 生成缩略图
   */

  let urlToSave = '';
  if (isSavePreviewImage && !newName) {
    const video = document.querySelector(`#video-${Number(stageState.currentVideoIndex) - 1} > video`)! as HTMLVideoElement;
    if (video) video.currentTime = 0
    // // const canvas: HTMLCanvasElement = document.getElementById('pixiCanvas')! as HTMLCanvasElement;
    const canvas2 = document.createElement('canvas');
    const context = canvas2.getContext('2d');
    canvas2.width = 480;
    canvas2.height = 270;
    context!.drawImage(video, 0, 0, 480, 270);
    urlToSave = canvas2.toDataURL('image/webp', 0.5);
    canvas2.remove();  
  } else {
    const userDataState = webgalStore.getState().saveData;
    // 获得存档文件
    const loadFile: ISaveData = userDataState.saveData[index];
    urlToSave = loadFile?.previewImage ?? ''
  }

  // 保存时间
  const currentTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false });

  const saveData: ISaveData = {
    nowStageState: cloneDeep(stageState),
    backlog: saveBacklog, // 舞台数据
    index: index, // 存档的序号
    saveName: newName || currentTime,
    saveTime: currentTime,
    sceneData: {
      currentSentenceId: WebGAL.sceneManager.sceneData.currentSentenceId, // 当前语句ID
      sceneStack: cloneDeep(WebGAL.sceneManager.sceneData.sceneStack), // 场景栈
      sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName, // 场景名称
      sceneUrl: WebGAL.sceneManager.sceneData.currentScene.sceneUrl, // 场景url
    },
    previewImage: urlToSave,
  };
  return saveData;
}

/**
 * 生成当前视频游戏快照，用于故事线播放
 */
export function getCurrentVideoStageDataForStoryLine() {
  // 获取到当前舞台数据和历史数据，并深度克隆一份
  const stageState = webgalStore.getState().stage;
  const saveBacklog = cloneDeep(WebGAL.backlogManager.getBacklog());
  const currentTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false });

  const saveData: ISaveData = {
    nowStageState: cloneDeep(stageState),
    backlog: saveBacklog, // 舞台数据
    saveTime:  currentTime, // 保存时间
    saveName: '',
    index: -1,
    previewImage: '',
    // 场景数据
    sceneData: {
      currentSentenceId: WebGAL.sceneManager.sceneData.currentSentenceId, // 当前语句ID
      sceneStack: cloneDeep(WebGAL.sceneManager.sceneData.sceneStack), // 场景栈
      sceneName: WebGAL.sceneManager.sceneData.currentScene.sceneName, // 场景名称
      sceneUrl: WebGAL.sceneManager.sceneData.currentScene.sceneUrl, // 场景url
    },
  };

  webgalStore.dispatch(saveActions.setSaveVideoData(saveData))
  // return saveData;
}