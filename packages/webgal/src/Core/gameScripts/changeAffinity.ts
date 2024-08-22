import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { addShowAffinityChangeList, setStage, updateShowAffinityChangeList } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { PERFORM_CONFIG } from '@/config';
import { WebGAL } from '@/Core/WebGAL';
import { smoothScrollToElement } from '../util/smoothScrollToElement';
import styles from './choose/choose.module.scss';
import { assetSetter, fileType } from '../util/gameAssetsAccess/assetSetter';

/**
 * 修改好感度
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const changeAffinity = (sentence: ISentence): IPerform => {
  const performInitName: string = getRandomPerformName();
  let roleUrl = assetSetter(sentence.content, fileType.ui);
  let numberUrl = '';
  let key = Date.now();

  sentence.args.forEach((e) => {
    if (e.key === 'number') {
      numberUrl = assetSetter(e.value.toString().trim(), fileType.ui);
    }
  });

  addShowAffinityChangeList({
    rolePicture: roleUrl,
    numberPicture: numberUrl,
    key,
  });

  setTimeout(() => {
    const list = webgalStore.getState().stage.showAffinityChangeList;
    const newList = list.filter((e) => e.key !== key);
    updateShowAffinityChangeList(newList);
  }, 3000);

  return {
    performName: performInitName,
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
