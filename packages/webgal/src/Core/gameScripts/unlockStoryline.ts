import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { webgalStore } from '@/store/store';
import { ISaveStoryLine, ISaveStoryLineData } from '@/store/userDataInterface';
import { getStorylineFromStorage, dumpStorylineToStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';
import { getCurrentVideoStageDataForStoryLine } from '@/Core/controller/storage/saveGame';
import { isInGame } from 'webgal/src/Core/parser/utils';
import { getRandomPerformName } from '../Modules/perform/performController';

/**
 * 解锁故事线
 * @param sentence 语句
 * @return {IPerform}
 */
export const unlockStoryline = (sentence: ISentence): IPerform => {
  console.log('解锁故事线 >>>>>>>> start : ', { sentence });

  const asyncAction = async () => {
    if (webgalStore.getState().GUI.isInGaming) {
      await getCurrentVideoStageDataForStoryLine();
    }
    // 读取本地解锁数据
    await getStorylineFromStorage();

    let thumbnailUrl = sentence?.content || '';
    const storyLineData = {} as unknown as ISaveStoryLine;

    // if (thumbnailUrl) {
    // storyLineData['thumbnailUrl'] = assetSetter(thumbnailUrl, fileType.ui);
    // }

    sentence.args.forEach((e) => {
      switch (e.key) {
        case 'name':
          storyLineData['name'] = e.value?.toString() ?? '';
          break;
        case 'x':
          storyLineData['x'] = (e.value && Number(e.value)) || 0;
          break;
        case 'y':
          storyLineData['y'] = (e.value && Number(e.value)) || 0;
          break;
        case 'hideName':
          storyLineData['isHideName'] = e.value.toString() === 'true';
          break;
        default:
          break;
      }
    });

    if (!storyLineData['name'] || !isInGame()) {
      return {
        performName: 'none',
        duration: 0,
        isHoldOn: false,
        stopFunction: () => {},
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,
      };
    }

    // 获取到数据
    const saveData = webgalStore.getState().saveData;
    const unlockItemIndex: number = saveData?.unlockStorylineList?.findIndex(
      (item) => item?.storyLine?.name === storyLineData['name'],
    );

    let unlockItem: ISaveStoryLineData | undefined;
    if (unlockItemIndex !== -1) {
      unlockItem = saveData.unlockStorylineList[unlockItemIndex];
    }

    const payload = {
      name: storyLineData['name'] || '',
      thumbnailUrl: storyLineData['thumbnailUrl'] || '',
      x: storyLineData['x'] || 0,
      y: storyLineData['y'] || 0,
      isHideName: storyLineData['isHideName'] || false,
      isUnlock: unlockItem?.storyLine?.isUnlock || saveData.isUnlockStoryline,
    };

    // 没有数据 或者 没有找到 > 存储到本地缓存
    if (unlockItemIndex === -1) {
      webgalStore.dispatch(
        saveActions.addStorylineList({
          storyLine: payload,
          videoData: webgalStore.getState().saveData.saveVideoData,
        }),
      );
    } else {
      // 如果存在，则替换掉源数据
      webgalStore.dispatch(
        saveActions.replaceStorylineList({
          index: unlockItemIndex,
          data: {
            storyLine: payload,
            videoData: webgalStore.getState().saveData.saveVideoData,
          },
        }),
      );
    }
    dumpStorylineToStorage();
  };

  asyncAction();

  return {
    performName: getRandomPerformName('unlockStoryline'),
    duration: 16,
    isHoldOn: false,
    stopFunction: () => {},
    // stopFunction: () => {
    //   WebGAL.events.textSettle.emit();
    // },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
