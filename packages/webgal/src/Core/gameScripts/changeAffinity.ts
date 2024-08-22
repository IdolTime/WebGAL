import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { addShowAffinityChangeList, setStage, updateShowAffinityChangeList } from '@/store/stageReducer';
import { assetSetter, fileType } from '../util/gameAssetsAccess/assetSetter';

/**
 * 修改好感度
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const changeAffinity = (sentence: ISentence): IPerform => {
  let roleUrl = assetSetter(sentence.content, fileType.ui);
  let numberUrl = '';
  let key = Date.now();

  sentence.args.forEach((e) => {
    if (e.key === 'number') {
      numberUrl = assetSetter(e.value.toString().trim(), fileType.ui);
    }
  });

  webgalStore.dispatch(
    addShowAffinityChangeList({
      rolePicture: roleUrl,
      numberPicture: numberUrl,
      key,
    }),
  );

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {
      // WebGAL.events.textSettle.emit();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: true,
  };
};
