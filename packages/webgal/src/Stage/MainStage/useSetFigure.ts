import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect, useMemo } from 'react';
import { logger } from '@/Core/util/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';

import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { sleep } from '@/Core/util/sleep';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight, freeFigure, live2dMotion, live2dExpression } = stageState;

  const freeFigureKeys = useMemo(() => {
    return freeFigure.map((item) => item.key).join(',');
  }, [freeFigure]);

  const handleFigure = async (thisFigKey: 'fig-left' | 'fig-center' | 'fig-right', figName: string) => {
    const softInAniKey = `${thisFigKey}-softin`;
    const figKeyMap = {
      'fig-left': '左',
      'fig-center': '中',
      'fig-right': '右',
    };
    const figPosition = thisFigKey.slice(4);

    if (figName !== '') {
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
      await Promise.all([addFigure(undefined, thisFigKey, figName, figPosition), sleep(0)]);
      logger.debug(`${figKeyMap[thisFigKey]}立绘已重设`);
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
    } else {
      logger.debug(`移除${figKeyMap[thisFigKey]}立绘`);
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
    }
  };

  const handleFreeFigures = async () => {
    // 自由立绘
    for (const fig of freeFigure) {
      /**
       * 特殊处理：自由立绘
       */
      const thisFigKey = `${fig.key}`;
      const softInAniKey = `${fig.key}-softin`;
      /**
       * 非空
       */
      if (fig.name !== '') {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
            await Promise.all([addFigure(undefined, thisFigKey, fig.name, fig.basePosition), sleep(0)]);
            logger.debug(`${fig.key}立绘已重设`);
            const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
            setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
          }
        } else {
          await Promise.all([addFigure(undefined, thisFigKey, fig.name, fig.basePosition), sleep(0)]);
          logger.debug(`${fig.key}立绘已重设`);
          const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
          WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
          setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
        }
      } else {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
          }
        }
      }
    }

    /**
     * 移除不在状态表中的立绘
     */
    const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
    if (currentFigures) {
      for (const existFigure of currentFigures) {
        if (
          existFigure.key === 'fig-left' ||
          existFigure.key === 'fig-center' ||
          existFigure.key === 'fig-right' ||
          existFigure.key.endsWith('-off')
        ) {
          // 什么也不做
        } else {
          const existKey = existFigure.key;
          const existFigInState = freeFigure.findIndex((fig) => fig.key === existKey);
          if (existFigInState < 0) {
            const softInAniKey = `${existFigure.key}-softin`;
            removeFig(existFigure, softInAniKey, stageState.effects);
          }
        }
      }
    }
  };

  /**
   * 同步 motion
   */
  useEffect(() => {
    for (const motion of live2dMotion) {
      WebGAL.gameplay.pixiStage?.changeModelMotionByKey(motion.target, motion.motion);
    }
  }, [live2dMotion]);

  /**
   * 同步 expression
   */
  useEffect(() => {
    for (const expression of live2dExpression) {
      WebGAL.gameplay.pixiStage?.changeModelExpressionByKey(expression.target, expression.expression);
    }
  }, [live2dExpression]);

  /**
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    handleFigure('fig-center', figName);
  }, [figName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    handleFigure('fig-left', figNameLeft);
  }, [figNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    handleFigure('fig-right', figNameRight);
  }, [figNameRight]);

  useEffect(() => {
    handleFreeFigures();
  }, [freeFigureKeys]);
}

function removeFig(figObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  return new Promise((resolve) => {
    WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
    // 快进，跳过退出动画
    if (WebGAL.gameplay.isFast) {
      logger.info('快速模式，立刻关闭立绘');
      WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figObj.key);
      resolve(true);
      return;
    }
    const oldFigKey = figObj.key;
    figObj.key = figObj.key + '-off';
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldFigKey);
    const figKey = figObj.key;
    const leaveKey = figKey + '-softoff';
    const { duration, animation } = getEnterExitAnimation(figKey, 'exit');
    WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, leaveKey, figKey, effects);
    setTimeout(() => {
      WebGAL.gameplay.pixiStage?.removeAnimation(leaveKey);
      WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figKey);
      resolve(true);
    }, duration);
  });
}

async function addFigure(type?: 'image' | 'live2D' | 'spine', ...args: any[]) {
  const url = args[1];
  if (url.endsWith('.json')) {
    return addLive2dFigure(...args);
  } else if (url.endsWith('.skel')) {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addSpineFigure(...args);
  } else if (url.endsWith('.png')) {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addFigure(...args, true);
  } else {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addFigure(...args);
  }
}

/**
 * 如果要使用 Live2D，取消这里的注释
 * @param args
 */
function addLive2dFigure(...args: any[]) {
  // @ts-ignore
  // return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);
}

function isAnimatedPNG(bytes: Uint8Array) {
  // Check if the file header matches the APNG signature
  const magic = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!bytes.slice(0, 8).every((v, i) => v === magic[i])) {
    return false;
  }
  const apngSignature = new Uint8Array([97, 99, 84, 76]);
  const apngSignatureOffset = 37;

  // Check if the file contains the APNG signature
  if (!bytes.slice(apngSignatureOffset, apngSignatureOffset + 4).every((v, i) => v === apngSignature[i])) {
    return false;
  }

  return true;
}
