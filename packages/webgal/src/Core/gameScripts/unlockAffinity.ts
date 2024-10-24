import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { IUnlockAffinityObj } from '@/store/stageInterface';
import { dumpUnlockAffinityToStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';
import { isInGame } from '../parser/utils';
import { getRandomPerformName } from '../Modules/perform/performController';

const emptyPerform = {
  performName: getRandomPerformName('unlockAffinity'),
  duration: 16,
  isHoldOn: false,
  stopFunction: () => {},
  blockingNext: () => false,
  blockingAuto: () => true,
  stopTimeout: undefined,
};

/**
 * 解锁好感人物
 * @param sentence 语句
 * @return {IPerform}
 */
export const unlockAffinity = (sentence: ISentence): IPerform => {
  console.log('解锁好感人物 >>>>>>>> start : ', { sentence });

  if (isInGame()) {
    return emptyPerform;
  }

  let url = sentence?.content || '';
  const unlockAchieveObj: IUnlockAffinityObj = {};
  unlockAchieveObj['url'] = url;

  sentence.args.forEach((e) => {
    switch (e.key) {
      case 'name':
        unlockAchieveObj['name'] = e.value?.toString() ?? '';
        break;
      case 'x':
        unlockAchieveObj['x'] = (e.value && Number(e.value)) || 0;
        break;
      case 'y':
        unlockAchieveObj['y'] = (e.value && Number(e.value)) || 0;
        break;
      default:
        break;
    }
  });
  const saveData = webgalStore.getState().saveData;

  if (!unlockAchieveObj['name'] || !unlockAchieveObj['url']) {
    return emptyPerform;
  }

  const unlockItemIndex = saveData.unlockAffinityData?.findIndex(
    (item) => item.name === unlockAchieveObj['name'] && item.url === unlockAchieveObj['url'],
  );

  // 保存时间
  const currentTime =
    new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false });

  const payload = {
    name: unlockAchieveObj['name'] || '',
    url: unlockAchieveObj['url'] || '',
    x: unlockAchieveObj['x'] || 0,
    y: unlockAchieveObj['y'] || 0,
    saveTime: currentTime,
    isUnlocked: true,
  };

  const newList = [...saveData.unlockAffinityData];

  if (unlockItemIndex !== -1) {
    newList[unlockItemIndex] = payload;
  } else {
    newList.push(payload);
  }

  webgalStore.dispatch(saveActions.updateAffinityData(newList));

  dumpUnlockAffinityToStorage();

  return emptyPerform;
};
