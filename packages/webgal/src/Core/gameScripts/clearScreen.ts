import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { getRandomPerformName } from '../Modules/perform/performController';
import { stopAllPerform } from '../controller/gamePlay/stopAllPerform';
import { resetStageState, setStage } from '@/store/stageReducer';
import { IStageState } from '@/store/stageInterface';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export function clearScreen(sentence: ISentence): IPerform {
  const dispatch = webgalStore.dispatch;
  const stageState = webgalStore.getState().stage;
  stopAllPerform();

  dispatch(
    resetStageState({
      ...stageState,
      freeFigure: [],
      freePopUpImage: [],
      figNameLeft: '',
      figNameRight: '',
      figName: '',
      popUpImageName: '',
      popUpImageNameLeft: '',
      popUpImageNameRight: '',
      bgName: '',
      showAffinityChangeList: [],
      showValueList: [],
      showName: '',
      showText: '',
    } satisfies Partial<IStageState>),
  );

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
