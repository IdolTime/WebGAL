import * as localforage from 'localforage';
import { IUserData } from '@/store/userDataInterface';
import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';
import { initState, resetUserData } from '@/store/userDataReducer';

import { WebGAL } from '@/Core/WebGAL';
import { getSavesFromCloud, uploadSavesToCloud } from './savesController';

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
  const userDataState = webgalStore.getState().userData;
  if (!WebGAL.gameId) {
    localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
      logger.info('写入本地存储');
    });
  } else {
    uploadSavesToCloud(WebGAL.gameKey, userDataState);
  }
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
  let newUserData: any;
  const callback = (_newUserData: IUserData) => {
    const newUserData = { ..._newUserData };
    newUserData && !!newUserData.token && delete newUserData.token;
    // 如果没有数据或者属性不完全，重新初始化
    if (!newUserData || !checkUserDataProperty(newUserData)) {
      logger.warn('现在重置数据');
      setStorage();
      return;
    }
    webgalStore.dispatch(resetUserData(newUserData as IUserData));
  };

  if (!WebGAL.gameId) {
    newUserData = localforage.getItem(WebGAL.gameKey).then((newUserData) => {
      callback(newUserData as IUserData);
    });
  } else {
    getSavesFromCloud(1).then(() => {
      newUserData = webgalStore.getState().userData;
      callback(newUserData);
    });
  }
}, 100);

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 防抖等待时间
 */
function debounce<T, K>(func: (...args: T[]) => K, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  function context(...args: T[]): K {
    clearTimeout(timeout);
    let ret!: K;
    timeout = setTimeout(() => {
      ret = func.apply(context, args);
    }, wait);
    return ret;
  }

  return context;
}

export const dumpToStorageFast = () => {
  const callback = (_newUserData: IUserData) => {
    const newUserData = { ..._newUserData };
    // @ts-ignore
    newUserData && !!newUserData.token && delete newUserData.token;
    // 如果没有数据，初始化
    if (!newUserData) {
      setStorage();
      return;
    }
    webgalStore.dispatch(resetUserData(newUserData as IUserData));
    logger.info('同步本地存储');
  };

  setStorageAsync().then(async () => {
    if (!WebGAL.gameId) {
      let newUserData = localforage.getItem(WebGAL.gameKey);
      // @ts-ignore
      callback(newUserData as IUserData);
    } else {
      await getSavesFromCloud(1);
      const newUserData = webgalStore.getState().userData;
      callback(newUserData);
    }
  });
};

/**
 * 检查用户数据属性是否齐全
 * @param userData 需要检查的数据
 */
function checkUserDataProperty(userData: any) {
  let result = true;
  for (const key in initState) {
    if (!userData.hasOwnProperty(key)) {
      result = false;
    }
  }
  return result;
}

export async function setStorageAsync() {
  const userDataState = webgalStore.getState().userData;

  if (!WebGAL.gameId) {
    return await localforage.setItem(WebGAL.gameKey, userDataState);
  }

  return await uploadSavesToCloud(WebGAL.gameKey, userDataState);
}

export async function getStorageAsync() {
  let newUserData: any;

  if (!WebGAL.gameId) {
    newUserData = await localforage.getItem(WebGAL.gameKey);
  } else {
    await getSavesFromCloud(1);
    newUserData = webgalStore.getState().userData;
  }

  if (!newUserData || !checkUserDataProperty(newUserData)) {
    logger.warn('现在重置数据');
    return await setStorageAsync();
  } else webgalStore.dispatch(resetUserData(newUserData as IUserData));
  return;
}
