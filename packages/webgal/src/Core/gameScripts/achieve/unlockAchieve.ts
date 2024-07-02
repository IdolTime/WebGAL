import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter'
import { webgalStore } from '@/store/store';
import { IUnlockAchieveObj } from '@/store/stageInterface';
import { getUnlickAchieveFromStorage, dumpUnlickAchieveToStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';

/**
 * 成就页-解锁成就
 * @param sentence 语句
 * @return {IPerform}
 */
export const unlockAchieve = (sentence: ISentence): IPerform => {
  console.log('解锁成就 >>>>>>>> start : ', { sentence })
  
  let url = sentence?.content || ''
  const unlockAchieveObj: IUnlockAchieveObj = {}

  if (url) {
    unlockAchieveObj['url'] = assetSetter(url, fileType.ui)
  }
  
  sentence.args.forEach((e) => {
    switch (e.key) {
      case 'unlockname':
        unlockAchieveObj['unlockname'] = e.value?.toString() ?? '';
        break;
      case 'x':
        unlockAchieveObj['x'] = e.value && Number(e.value) || 0;
        break;
      case 'y':
        unlockAchieveObj['y'] = e.value && Number(e.value) || 0;
        break;
      default:
        break;
    }
  });

  // webgalStore.dispatch(setUnlockAchieve(unlockAchieveObj));

  if (!unlockAchieveObj['unlockname'] || !unlockAchieveObj['url']) {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined
    }
  }

   // 读取本地解锁数据
   getUnlickAchieveFromStorage()
   //获取到数据
  const saveData = webgalStore.getState().saveData;

  if (!saveData.isShowUnlock) {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined
    }
  }

  const unlockItemIndex =  saveData.unlockAchieveData?.findIndex(
    item => item.unlockname === unlockAchieveObj['unlockname'] && item.url === unlockAchieveObj['url']
  );

  let unlockItem: any | undefined
  if (unlockItemIndex !== -1) {
    unlockItem = saveData.unlockAchieveData[unlockItemIndex]
  }
  

 // 保存时间
  const currentTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false });

   const payload = {
    unlockname: unlockAchieveObj['unlockname'] || '',
    url: unlockAchieveObj['url'] || '',
    x: unlockAchieveObj['x'] || 0,
    y: unlockAchieveObj['y'] || 0,
    saveTime: currentTime,
    isShow: saveData.isShowUnlock || unlockItem?.isShow || false,
  }

  // 没有数据 或者 没有找到 > 存储到本地缓存
  if (unlockItemIndex === -1) {
    webgalStore.dispatch(
      saveActions.addUnlockAchieveData(payload)
    )
  } else {
    // 如果存在，则替换掉源数据
    webgalStore.dispatch(
      saveActions.replaceUnlockAchieveData({ index: unlockItemIndex, data: payload })
    )
  }
  dumpUnlickAchieveToStorage()

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  }
}
