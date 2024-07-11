import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage, addShowValueList } from '@/store/stageReducer';
import { IShowValueListItem } from '@/store/stageInterface';


/**
 * 语句执行的模板代码
 * @param sentence
 */
export function showValue(sentence: ISentence): IPerform {

  const payload: IShowValueListItem = {
    isShowValueSWitch: false,
    showValueName: '',
    showValueAxisX: 0,
    showValueAxisY: 0,
  }

	if (sentence?.content) {
		webgalStore.dispatch(setStage({ key: 'showValueName', value: sentence.content }));
    payload['showValueName'] = sentence.content
	}

	sentence.args.forEach((e) => {
    if (e.key === 'switchValue') {
			webgalStore.dispatch(
				setStage({ key: 'isShowValueSWitch', value: e.value })
			);
			payload['isShowValueSWitch'] = !!e.value
    } else if (e.key === 'x') {
			webgalStore.dispatch(
				setStage({ key: 'showValueAxisX', value: Number(e.value) })
			);
      payload['showValueAxisX'] = Number(e.value)
    } else if (e.key === 'y') {
			webgalStore.dispatch(
				setStage({ key: 'showValueAxisY', value: Number(e.value) })
			);
      payload['showValueAxisY'] = Number(e.value)
    }
  });

  webgalStore.dispatch(addShowValueList(payload))

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

