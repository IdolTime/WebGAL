import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { getRandomPerformName } from '../Modules/perform/performController';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export function setTextbox(sentence: ISentence): IPerform {
  if (sentence.content === 'hide') {
    webgalStore.dispatch(setStage({ key: 'isDisableTextbox', value: true }));
  } else {
    webgalStore.dispatch(setStage({ key: 'isDisableTextbox', value: false }));
  }
  return {
    performName: getRandomPerformName(),
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
}
