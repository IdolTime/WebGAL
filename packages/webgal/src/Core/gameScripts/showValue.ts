import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage, addShowValueList } from '@/store/stageReducer';
import { IShowValueListItem } from '@/store/stageInterface';

const parseStyle = (styleString: string) => {
  const styleRegex = /\{(.*?)\}/;
  const styleMatch = styleString.match(styleRegex);
  if (styleMatch) {
    const styleStr = styleMatch[1];
    const styleProps = styleStr.split(',');
    const style: any = {}; // Change to specific type if possible

    // Parse each style property
    styleProps.forEach((prop) => {
      const [key, value] = prop.split('=');
      if (key && value) {
        style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
      }
    });

    return style;
  }
};

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
    showProgress: false,
  };

  if (sentence?.content) {
    payload['showValueName'] = sentence.content;
  }

  sentence.args.forEach((e) => {
    if (e.key === 'switchValue') {
      payload['isShowValueSWitch'] = !!e.value;
    } else if (e.key === 'x') {
      payload['showValueAxisX'] = Number(e.value);
    } else if (e.key === 'y') {
      payload['showValueAxisY'] = Number(e.value);
    } else if (e.key === 'showProgress') {
      payload['showProgress'] = !!e.value;
    } else if (e.key === 'progressBarBgStyle') {
      payload['progressBarBgStyle'] = parseStyle(e.value as string);
    } else if (e.key === 'progressBarStyle') {
      payload['progressBarStyle'] = parseStyle(e.value as string);
    } else if (e.key === 'maxValue') {
      payload['maxValue'] = Number(e.value);
    }
  });

  webgalStore.dispatch(addShowValueList(payload));

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
