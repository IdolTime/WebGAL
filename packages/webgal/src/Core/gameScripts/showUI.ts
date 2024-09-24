import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';

/**
 * 显示/关闭UI
 * @param sentence
 */
export function showUI(sentence: ISentence): IPerform {
  if (sentence.content === 'hide') {
    webgalStore.dispatch(setVisibility({ component: 'isHideGameUI', visibility: true }));
  } else {
    webgalStore.dispatch(setVisibility({ component: 'isHideGameUI', visibility: false }));
  }
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
}
