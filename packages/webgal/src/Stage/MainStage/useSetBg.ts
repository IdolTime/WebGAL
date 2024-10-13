import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';

import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { sleep } from '@/Core/util/sleep';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    const callback = async () => {
      const thisBgKey = 'bg-main';
      if (bgName !== '') {
        const { bgX, bgY } = stageState;
        const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
        if (currentBg) {
          if (currentBg.sourceUrl !== bgName) {
            removeBg(currentBg);
          }
        }
        await Promise.all([WebGAL.gameplay.pixiStage?.addBg(thisBgKey, bgName, bgX, bgY), sleep(50)]);
        setEbg(bgName);
        logger.debug('重设背景');
        const { duration, animation } = getEnterExitAnimation('bg-main', 'enter', true);
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, 'bg-main-softin', thisBgKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects('bg-main-softin'), duration);
      } else {
        const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
        if (currentBg) {
          removeBg(currentBg);
        }
      }
    };

    callback();
  }, [bgName]);
}

function removeBg(bgObject: IStageObject) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects('bg-main-softin');
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getEnterExitAnimation('bg-main-off', 'exit', true);
  WebGAL.gameplay.pixiStage!.registerAnimation(animation, 'bg-main-softoff', 'bg-main-off');
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation('bg-main-softoff');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey('bg-main-off');
  }, duration);
}
