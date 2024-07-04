import localforage from 'localforage';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { ISaveData, ISaveStoryLineData } from '@/store/userDataInterface';
import { IUnlockAchieveItem } from '@/store/stageInterface'

export function dumpSavesToStorage(startIndex: number, endIndex: number) {
  for (let i = startIndex; i <= endIndex; i++) {
    const save = webgalStore.getState().saveData.saveData[i];
    if (save) {
      localforage.setItem(`${WebGAL.gameKey}-saves${i}`, save).then(() => {
        logger.info(`存档${i}写入本地存储`);
      });
    }
  }
}

export async function getSavesFromStorage(startIndex: number, endIndex: number) {
  for (let i = startIndex; i <= endIndex; i++) {
    const save = await localforage.getItem(`${WebGAL.gameKey}-saves${i}`);
    // localforage.getItem(`${WebGAL.gameKey}-saves${i}`).then((save) => {
      webgalStore.dispatch(saveActions.saveGame({ index: i, saveData: save as ISaveData }));
      logger.info(`存档${i}读取自本地存储`);
    // });
  }
}

export async function dumpFastSaveToStorage() {
  const save = webgalStore.getState().saveData.quickSaveData;
  await localforage.setItem(`${WebGAL.gameKey}-saves-fast`, save);
  logger.info(`快速存档写入本地存储`);
}

export async function getFastSaveFromStorage() {
  const save = await localforage.getItem(`${WebGAL.gameKey}-saves-fast`);
  webgalStore.dispatch(saveActions.setFastSave(save as ISaveData));
  logger.info(`快速存档读取自本地存储`);
}

export async function dumpStorylineToStorage() {
  const data = webgalStore.getState().saveData.unlockStorylineList;
  await localforage.setItem(`${WebGAL.gameKey}-storyline`, { data });
  logger.info(`故事线 >> 写入本地存储`);
}

export async function getStorylineFromStorage() {
  const res: any = await localforage.getItem(`${WebGAL.gameKey}-storyline`);
  webgalStore.dispatch(saveActions.setStorylineListFromStorage((res?.data ?? []) as ISaveStoryLineData[]));
  logger.info(`故事线 >> 读取自本地存储`);
}

export async function dumpUnlickAchieveToStorage() {
  const data = webgalStore.getState().saveData.unlockAchieveData;
  await localforage.setItem(`${WebGAL.gameKey}-unlock-achieve`, { data });
  logger.info(`解锁成就 >>> 写入本地存储`);
}

export async function getUnlickAchieveFromStorage() {
  const res: any = await localforage.getItem(`${WebGAL.gameKey}-unlock-achieve`);
  webgalStore.dispatch(saveActions.setUnlockAchieveData((res?.data || []) as IUnlockAchieveItem[]));
  logger.info(`解锁成就 >>> 读取本地存储`);
}
