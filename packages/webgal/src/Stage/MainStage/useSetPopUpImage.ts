import { useEffect } from 'react';
import { IEffect, IStageState } from '@/store/stageInterface';
import { WebGAL } from '@/Core/WebGAL';
import { logger } from '@/Core/util/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { fetchFileAsArrayBuffer } from '@/Core/util/fetchFileAsArrayBuffer';

export function useSetPopUpImage(stageState: IStageState) {
  const { 
    popUpImageName, 
    popUpImageNameLeft, 
    popUpImageNameRight, 
    freePopUpImage, 
    popImgLive2dMotion, 
    popImgLive2dExpression 
  } = stageState;

  /**
   * 同步 motion
   */
  useEffect(() => {
    for (const motion of popImgLive2dMotion) {
      WebGAL.gameplay.pixiStage?.changeModelMotionByKey(motion.target, motion.motion);
    }
  }, [popImgLive2dMotion]);

  /**
   * 同步 expression
   */
  useEffect(() => {
    for (const expression of popImgLive2dExpression) {
      WebGAL.gameplay.pixiStage?.changeModelExpressionByKey(expression.target, expression.expression);
    }
  }, [popImgLive2dExpression]);

  /**
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    const thisFigKey = 'popImg-center';
    const softInAniKey = 'popImg-center-softin';
    if (popUpImageName !== '') {
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== popUpImageName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
      addFigure(undefined, thisFigKey, popUpImageName, 'center');
      logger.debug('中弹窗图片已重设');
      setTimeout(() => {
        const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
      }, 32);
    } else {
      logger.debug('移除中弹窗图片');
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== popUpImageName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
    }
  }, [popUpImageName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    const thisFigKey = 'popImg-left';
    const softInAniKey = 'popImg-left-softin';
    if (popUpImageNameLeft !== '') {
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== popUpImageNameLeft) {
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
        }
      }
      addFigure(undefined, thisFigKey, popUpImageNameLeft, 'left');
      logger.debug('左弹窗图片已重设');
      setTimeout(() => {
        const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
      }, 32);
    } else {
      logger.debug('移除左弹窗图片');
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== popUpImageNameLeft) {
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
        }
      }
    }
  }, [popUpImageNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    const thisFigKey = 'popImg-right';
    const softInAniKey = 'popImg-right-softin';
    if (popUpImageNameRight !== '') {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== popUpImageNameRight) {
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
      addFigure(undefined, thisFigKey, popUpImageNameRight, 'right');
      logger.debug('右弹窗图片已重设');
      setTimeout(() => {
        const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
      }, 32);
    } else {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== popUpImageNameRight) {
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
    }
  }, [popUpImageNameRight]);

  useEffect(() => {
    // 自由立绘
    for (const popImg of freePopUpImage) {
      /**
       * 特殊处理：自由立绘
       */
      const thisFigKey = `${popImg.key}`;
      const softInAniKey = `${popImg.key}-softin`;
      /**
       * 非空
       */
      if (popImg.name !== '') {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== popImg.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
            addFigure(undefined, thisFigKey, popImg.name, popImg.basePosition);
            logger.debug(`${popImg.key}弹窗图片已重设`);
            setTimeout(() => {
              const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
              WebGAL.gameplay.pixiStage!.registerPresetAnimation(
                animation,
                softInAniKey,
                thisFigKey,
                stageState.effects,
              );
              setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
            }, 32);
          }
        } else {
          addFigure(undefined, thisFigKey, popImg.name, popImg.basePosition);
          logger.debug(`${popImg.key}弹窗图片已重设`);
          setTimeout(() => {
            const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
            setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
          }, 32);
        }
      } else {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== popImg.name) {
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
          existFigure.key === 'popImg-left' ||
          existFigure.key === 'popImg-center' ||
          existFigure.key === 'popImg-right' ||
          existFigure.key.endsWith('-off')
        ) {
          // 什么也不做
        } else {
          const existKey = existFigure.key;
          const existFigInState = freePopUpImage.findIndex((popImg) => popImg.key === existKey);
          if (existFigInState < 0) {
            const softInAniKey = `${existFigure.key}-softin`;
            removeFig(existFigure, softInAniKey, stageState.effects);
          }
        }
      }
    }
  }, [freePopUpImage]);
}

function removeFig(figObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  // 快进，跳过退出动画
  if (WebGAL.gameplay.isFast) {
    logger.info('快速模式，立刻关闭弹窗图片');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figObj.key);
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
  }, duration);
}

function addFigure(type?: 'image' | 'live2D' | 'spine', ...args: any[]) {
  const url = args[1];
  if (url.endsWith('.json')) {
    return addLive2dFigure(...args);
  } else if (url.endsWith('.skel')) {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addSpineFigure(...args);
  } else if (url.endsWith('.png')) {
    fetchFileAsArrayBuffer(url).then((arrayBuffer) => {
      // @ts-ignore
      return WebGAL.gameplay.pixiStage?.addFigure(...args, isAnimatedPNG(arrayBuffer));
    });
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
