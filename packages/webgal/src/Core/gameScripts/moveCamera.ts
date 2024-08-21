import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { PERFORM_CONFIG } from '@/config';
import { WebGAL } from '@/Core/WebGAL';
import { smoothScrollToElement } from '../util/smoothScrollToElement';

/**
 * 移动镜头
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const moveCamera = (sentence: ISentence): IPerform => {
  const performInitName: string = getRandomPerformName();
  let endDelay = 0;
  let x = 0;
  let y = 0;
  let goNextWhenOver = false;

  console.log('移动镜头 >>>>>>>> start : ', { sentence });

  sentence.args.forEach((e) => {
    if (e.key === 'duration') {
      endDelay = Number(e.value);
    } else if (e.key === 'x') {
      x = Number(e.value);
    } else if (e.key === 'y') {
      y = Number(e.value);
    } else if (e.key === 'next') {
      goNextWhenOver = e.value === 'true';
    }
  });

  const cameraElement = document.getElementById('camera');

  if (cameraElement) {
    logger.info(`移动镜头：${x}：${y}`);
    smoothScrollToElement(cameraElement, x, y, endDelay);
  }

  return {
    performName: performInitName,
    duration: endDelay,
    isHoldOn: false,
    stopFunction: () => {
      // WebGAL.events.textSettle.emit();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver,
  };
};
