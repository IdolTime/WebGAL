import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { webgalStore } from '@/store/store';
import { ISaveStoryLine } from '@/store/userDataInterface';
import { getStorylineFromStorage, dumpStorylineToStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';

/**
 * 解锁故事线
 * @param sentence 语句
 * @return {IPerform}
 */
export const unlockStoryline = (sentence: ISentence): IPerform => {
  console.log('解锁故事线 >>>>>>>> start : ', { sentence });

  const asyncAction = async () => {
    // 读取本地解锁数据
    await getStorylineFromStorage();

    let thumbnailUrl = sentence?.content || '';
    const storyLineData = {} as unknown as ISaveStoryLine;
    // const storyLineData: any = {}

    if (thumbnailUrl) {
      storyLineData['thumbnailUrl'] = assetSetter(thumbnailUrl, fileType.ui);
    }

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
        default:
          break;
      }
    });

    if (storyLineData['name'] === '' && storyLineData['thumbnailUrl'] === '') {
      return {
        performName: 'none',
        duration: 0,
        isHoldOn: false,
        stopFunction: () => { },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,
      };
    }

    // 获取到数据
    const saveData = webgalStore.getState().saveData;
    console.log(777777, JSON.parse(JSON.stringify(saveData)))
    const unlockItemIndex = saveData.unlockStorylineList?.findIndex(
      (item) => item.storyLine.name === storyLineData['name'],
    );

    const payload = {
      name: storyLineData['name'] || '',
      thumbnailUrl: storyLineData['thumbnailUrl'] || '',
      x: storyLineData['x'] || 0,
      y: storyLineData['y'] || 0,
      isUnlock: true,
    };

    // 没有数据 或者 没有找到 > 存储到本地缓存
    if (unlockItemIndex === -1) {
      console.log(5555555, JSON.parse(JSON.stringify(payload)))
      webgalStore.dispatch(
        saveActions.addStorylineList({
          storyLine: payload,
          videoData: webgalStore.getState().saveData.saveVideoData,
        }),
      );
    } else {
      console.log(6666666, JSON.parse(JSON.stringify(payload)))

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
  }

  asyncAction();

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => { },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
