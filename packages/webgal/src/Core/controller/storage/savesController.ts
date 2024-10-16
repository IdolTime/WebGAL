import localforage from 'localforage';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { ISaveAffinity, ISaveData, ISaveStoryLineData, IUserData } from '@/store/userDataInterface';
import { IUnlockAchieveItem } from '@/store/stageInterface';
import { request } from '@/utils/request';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { resetUserData } from '@/store/userDataReducer';

let lastGetType1SavesTime = 0;
let lastGetType2SavesTime = 0;
let lastStorylineSaveTime = 0;
let lastAffinitySaveTime = 0;
let lastAchiveSaveTime = 0;

const getUserId = () => {
  if (WebGAL.channel === '0') {
    return String(webgalStore.getState().userData.userInfo?.userId || 0);
  }

  return sessionStorage.getItem('sdk-userId') as string;
};

export function dumpSavesToStorage(startIndex: number, endIndex: number) {
  if (!WebGAL.gameId) {
    for (let i = startIndex; i <= endIndex; i++) {
      const save = webgalStore.getState().saveData.saveData[i];
      if (save) {
        localforage.setItem(`${WebGAL.gameKey}-saves${i}`, save).then(() => {
          logger.info(`存档${i}写入本地存储`);
        });
      }
    }
    return;
  }
  dumpSavesToCloud(startIndex, endIndex);
}

// Function to dump saves to cloud
export async function dumpSavesToCloud(startIndex: number, endIndex: number) {
  const promises: any = [];
  const failedUploads: Record<string, ISaveData> = {};

  // @ts-ignore
  window.pubsub.publish('loading', { loading: true });

  for (let i = startIndex; i <= endIndex; i++) {
    const save = webgalStore.getState().saveData.saveData[i];
    if (save) {
      const uploadPromise = request
        .post('/editor/game/file_save', {
          userId: getUserId(),
          gId: WebGAL.gameId, // Your game ID
          fileType: 2,
          key: `${WebGAL.gameKey}-saves${i}`,
          value: JSON.stringify(save),
        })
        .then((res) => {
          if (res.data.code === 0) {
            logger.info(`存档${i}上传成功`);
            // @ts-ignore
            window.pubsub.publish('toaster', { show: true, text: '存档上传成功' });
          } else {
            throw new Error(res.data.message);
          }
        })
        .catch((error) => {
          logger.error(`存档${i}上传失败: ${error.message}`);
          failedUploads[`${WebGAL.gameKey}-saves${i}`] = save; // Store the index of the failed save
        });

      promises.push(uploadPromise);
    }
  }

  // Execute all the requests in parallel
  await Promise.all(promises).finally(() => {
    // @ts-ignore
    window.pubsub.publish('loading', { loading: false });
  });

  const failedLen = Object.values(failedUploads).length;

  // If any uploads failed, alert the user and allow retry
  if (failedLen > 0) {
    showGlogalDialog({
      title: '存档上传失败',
      content: `共${failedLen}个存档上传失败, 重试吗?`,
      leftText: '取消',
      rightText: '重试',
      leftFunc: () => {},
      rightFunc: () => {
        retryFailedUploads(failedUploads, 2);
      },
    });
  }
}

export async function uploadSavesToCloud(key: string, save: any, silent = true) {
  const promises: any = [];
  const failedUploads: Record<string, ISaveData> = {};

  if (!silent) {
    // @ts-ignore
    window.pubsub.publish('loading', { loading: true });
  }

  if (save) {
    const uploadPromise = request
      .post('/editor/game/file_save', {
        userId: getUserId(),
        gId: WebGAL.gameId, // Your game ID
        fileType: 1,
        key: key,
        value: JSON.stringify(save),
      })
      .then((res) => {
        if (res.data.code === 0) {
          logger.info(`存档${key}上传到云存储`);
        } else {
          throw new Error(res.data.message);
        }
      })
      .catch((error) => {
        logger.error(`存档${key}上传失败: ${error.message}`);
        failedUploads[key] = save; // Store the index of the failed save
      });

    promises.push(uploadPromise);
  }

  // Execute all the requests in parallel
  await Promise.all(promises).finally(() => {
    // @ts-ignore
    silent && window.pubsub.publish('loading', { loading: false });
  });

  const failedLen = Object.values(failedUploads).length;

  // If any uploads failed, alert the user and allow retry
  if (failedLen) {
    showGlogalDialog({
      title: '存档上传失败',
      content: `共${failedUploads.length}个存档上传失败, 重试吗?`,
      leftText: '取消',
      rightText: '重试',
      leftFunc: () => {},
      rightFunc: () => {
        retryFailedUploads(failedUploads, 1);
      },
    });
  }
}

// Retry failed uploads
async function retryFailedUploads(failedIndices: Record<string, ISaveData>, fileType: number) {
  const keys = Object.keys(failedIndices);
  const retryPromises = keys.map((key) => {
    const save = failedIndices[key];
    if (save) {
      return request
        .post('/editor/game/file_save', {
          userId: getUserId(),
          gId: WebGAL.gameId, // Your game ID
          fileType: 1,
          key,
          value: JSON.stringify(save),
        })
        .then((res) => {
          if (res.data.code === 0) {
            logger.info(`存档${key}重新上传成功`);
          } else {
            throw new Error(res.data.message);
          }
        })
        .catch((error) => {
          logger.error(`存档${key}重新上传失败: ${error.message}`);
        });
    }

    return Promise.resolve();
  });

  // Retry all failed uploads
  await Promise.all(retryPromises);
}

export async function getSavesFromStorage(startIndex: number, endIndex: number) {
  logger.info(`获取存档${startIndex}-${endIndex}`);
  if (!WebGAL.gameId) {
    for (let i = startIndex; i <= endIndex; i++) {
      const save = await localforage.getItem(`${WebGAL.gameKey}-saves${i}`);
      webgalStore.dispatch(saveActions.saveGame({ index: i, saveData: save as ISaveData }));
      logger.info(`存档${i}读取自本地存储`);
    }
  } else {
    await getSavesFromCloud(2);
  }
}

export async function getSavesFromCloud(fileType: number, page = 1, pageSize = 10) {
  if (fileType === 1 && Date.now() - lastGetType1SavesTime < 3000) return;
  if (fileType === 2 && page === 1 && Date.now() - lastGetType2SavesTime < 3000) return;

  if (fileType === 2) {
    if (page > 3) {
      return;
    }
    // @ts-ignore
    window.pubsub.publish('loading', { loading: true });
    lastGetType2SavesTime = Date.now();
  } else {
    lastGetType1SavesTime = Date.now();
  }

  try {
    const response = await request.post('/editor/game/file_list', {
      userId: getUserId(),
      page,
      pageSize,
      fileType,
      gId: WebGAL.gameId,
    });
    const data = response.data.data;

    if (response.data.code === 0) {
      const saves: {
        key: string;
        value: string;
      }[] = data.data || [];
      for (const save of saves) {
        const v = escapeContentAndValueQuotes(save.value);

        const parsedSave = JSON.parse(v);
        if (save.key === `${WebGAL.gameKey}-saves-fast`) {
          webgalStore.dispatch(saveActions.setFastSave(parsedSave as ISaveData));
        } else if (new RegExp(`${WebGAL.gameKey}-saves[0-9]+`).test(save.key)) {
          webgalStore.dispatch(
            saveActions.saveGame({
              index: Number(save.key.replace(`${WebGAL.gameKey}-saves`, '')),
              saveData: parsedSave as ISaveData,
            }),
          );
        } else if (save.key === `${WebGAL.gameKey}-storyline`) {
          webgalStore.dispatch(saveActions.setStorylineListFromStorage(parsedSave.data as ISaveStoryLineData[]));
        } else if (save.key === `${WebGAL.gameKey}-unlock-affinity`) {
          webgalStore.dispatch(saveActions.updateAffinityData(parsedSave.data as ISaveAffinity[]));
        } else if (save.key === `${WebGAL.gameKey}-unlock-achieve`) {
          webgalStore.dispatch(saveActions.setUnlockAchieveData(parsedSave.data as IUnlockAchieveItem[]));
        } else if (save.key === WebGAL.gameKey) {
          webgalStore.dispatch(resetUserData(parsedSave as IUserData));
        }
      }

      if (fileType === 2) {
        const currentSavesLength = webgalStore.getState().saveData.saveData.filter((x) => x).length;

        if (currentSavesLength < data.total) {
          await getSavesFromCloud(2, page + 1, pageSize);
        }
      }
    } else {
      console.error(response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error: any) {
    console.error(error);
    showGlogalDialog({
      title: '读取存档失败',
      content: error.message,
      leftText: '取消',
      rightText: '重试',
      leftFunc: () => {},
      rightFunc: () => {
        getSavesFromCloud(fileType);
      },
    });
  } finally {
    // @ts-ignore
    window.pubsub.publish('loading', { loading: false });
  }
}

export async function deleteSaveFromCloud(key: string) {
  try {
    await request.post('/editor/game/file_remove', {
      userId: getUserId(),
      key,
      gId: WebGAL.gameId, // Your game ID
    });
    logger.info(`存档${key}删除自云存储`);
  } catch (error: any) {
    logger.error(`存档${key}删除失败: ${error.message}`);
  }
}

export async function dumpFastSaveToStorage() {
  const save = webgalStore.getState().saveData.quickSaveData;
  if (!WebGAL.gameId) {
    await localforage.setItem(`${WebGAL.gameKey}-saves-fast`, save);
    logger.info(`快速存档写入本地存储`);
  } else {
    await uploadSavesToCloud(`${WebGAL.gameKey}-saves-fast`, save);
  }
}

export async function getFastSaveFromStorage() {
  logger.info(`获取快速存档`);
  if (!WebGAL.gameId) {
    const save = await localforage.getItem(`${WebGAL.gameKey}-saves-fast`);
    webgalStore.dispatch(saveActions.setFastSave(save as ISaveData));
  } else {
    await getSavesFromCloud(1);
  }
}

export async function dumpStorylineToStorage() {
  const data = webgalStore.getState().saveData.unlockStorylineList;
  if (!WebGAL.gameId) {
    await localforage.setItem(`${WebGAL.gameKey}-storyline`, { data });
    logger.info(`故事线 >> 写入本地存储`);
  } else {
    if (Date.now() - lastStorylineSaveTime < 3000) return;
    lastStorylineSaveTime = Date.now();
    await uploadSavesToCloud(`${WebGAL.gameKey}-storyline`, { data });
  }
}

export async function getStorylineFromStorage() {
  if (!WebGAL.gameId) {
    logger.info(`获取故事线存档`);
    const res: any = await localforage.getItem(`${WebGAL.gameKey}-storyline`);
    webgalStore.dispatch(saveActions.setStorylineListFromStorage((res?.data ?? []) as ISaveStoryLineData[]));
  } else {
    await getSavesFromCloud(1);
  }
}

export async function dumpUnlockAffinityToStorage() {
  const data = webgalStore.getState().saveData.unlockAffinityData;
  if (!WebGAL.gameId) {
    await localforage.setItem(`${WebGAL.gameKey}-unlock-affinity`, { data });
    logger.info(`解锁亲密度 >> 写入本地存储`);
  } else {
    if (Date.now() - lastAffinitySaveTime < 3000) return;
    lastAffinitySaveTime = Date.now();
    await uploadSavesToCloud(`${WebGAL.gameKey}-unlock-affinity`, { data });
  }
}

export async function getUnlockAffinityFromStorage() {
  logger.info(`获取亲密度存档`);
  if (!WebGAL.gameId) {
    const res: any = await localforage.getItem(`${WebGAL.gameKey}-unlock-affinity`);
    webgalStore.dispatch(saveActions.updateAffinityData((res?.data ?? []) as ISaveAffinity[]));
    logger.info(`解锁亲密度 >> 读取本地存储`);
  } else {
    await getSavesFromCloud(1);
  }
}

export async function dumpUnlickAchieveToStorage() {
  const data = webgalStore.getState().saveData.unlockAchieveData;
  if (!WebGAL.gameId) {
    await localforage.setItem(`${WebGAL.gameKey}-unlock-achieve`, { data });
    logger.info(`解锁成就 >>> 写入本地存储`);
  } else {
    if (Date.now() - lastAchiveSaveTime < 3000) return;
    lastAchiveSaveTime = Date.now();
    await uploadSavesToCloud(`${WebGAL.gameKey}-unlock-achieve`, { data });
  }
}

export async function getUnlickAchieveFromStorage() {
  logger.info(`获取承接存档`);

  if (!WebGAL.gameId) {
    const res: any = await localforage.getItem(`${WebGAL.gameKey}-unlock-achieve`);
    webgalStore.dispatch(saveActions.setUnlockAchieveData((res?.data || []) as IUnlockAchieveItem[]));
    logger.info(`解锁成就 >>> 读取本地存储`);
  } else {
    await getSavesFromCloud(1);
  }
}

function escapeContentAndValueQuotes(str: string) {
  // 扩展正则表达式以同时匹配 content 和 value 字段
  // eslint-disable-next-line max-params
  return str.replace(/\"(content|value)\":\"(.*?)\"(,|})/g, function (match, field, value, delimiter) {
    // 转义内部的双引号
    const escapedValue = value.replace(/\"/g, '\\"');
    // 返回匹配结果，确保 content 和 value 字段都能正确处理
    return `"${field}":"${escapedValue}"${delimiter}`;
  });
}
