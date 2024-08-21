import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStageVar, addShowValues } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { compile } from 'angular-expressions';
import { setGlobalVar } from '@/store/userDataReducer';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { ISetGameVar } from '@/store/stageInterface';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { getRandomInt } from '@/Core/util/getRandomInt'

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  let setGlobal = false;
  let minValue: number | null = null;
  let maxValue: number | null = null;
  let random: boolean = false;
  let randomNumber: number = 0

  sentence.args.forEach((e) => {
    if (e.key === 'global') {
      setGlobal = true;
    } else if (e.key === 'minValue') {
      minValue = e.value as number;
    } else if (e.key === 'maxValue') {
      maxValue = e.value as number;
    } else if (e.key === 'random') {
      random = e.value as boolean;
    }
  });

  // 生成随机数
  if (random && minValue !== null && maxValue !== null) {
    randomNumber = getRandomInt(minValue, maxValue)
  }

  let targetReducerFunction: ActionCreatorWithPayload<ISetGameVar, string>;
  if (setGlobal) {
    targetReducerFunction = setGlobalVar;
  } else {
    targetReducerFunction = setStageVar;
  }
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.match(/=/)) {
    const key = sentence.content.split(/=/)[0];
    const valExp = sentence.content.split(/=/)[1];
    if (valExp === 'random()') {
      const randomVal = random ? randomNumber : Math.random()
      webgalStore.dispatch(targetReducerFunction({ key, value: randomVal }));
      webgalStore.dispatch(addShowValues({ key, value: randomVal }));
    } else if (valExp.match(/[+\-*\/()]/) && !random) {
      // 如果包含加减乘除号，则运算
      // 先取出运算表达式中的变量
      const valExpArr = valExp.split(/([+\-*\/()])/g);
      // 将变量替换为变量的值，然后合成表达式字符串
      const valExp2 = valExpArr
        .map((e) => {
          if (e.match(/[a-zA-Z]/)) {
            return getValueFromState(e).toString();
          } else return e;
        })
        .reduce((pre, curr) => pre + curr, '');
      const exp = compile(valExp2);
      let result = exp();

      if (typeof result === 'number') {
        if (typeof minValue === 'number') {
          if (result < minValue) {
            result = minValue;
          }
        }

        if (typeof maxValue === 'number') {
          if (result > maxValue) {
            result = maxValue;
          }
        }
      }

      webgalStore.dispatch(targetReducerFunction({ key, value: result }));
      webgalStore.dispatch(addShowValues({ key, value: result }));
    } else if (valExp.match(/true|false/) && !random) {
      if (valExp.match(/true/)) {
        webgalStore.dispatch(targetReducerFunction({ key, value: true }));
        webgalStore.dispatch(addShowValues({ key, value: true }));
      }
      if (valExp.match(/false/)) {
        webgalStore.dispatch(targetReducerFunction({ key, value: false }));
        webgalStore.dispatch(addShowValues({ key, value: false }));
      }
    } else {
      if (!isNaN(Number(valExp))) {
        webgalStore.dispatch(targetReducerFunction({ key, value: random ? randomNumber : Number(valExp) }));
        webgalStore.dispatch(addShowValues({ key, value: random ? randomNumber : Number(valExp) }));
      } else {
        webgalStore.dispatch(targetReducerFunction({ key, value: random ? randomNumber : valExp }));
        webgalStore.dispatch(addShowValues({ key, value: random ? randomNumber : valExp }));
      } 
    }
    if (setGlobal) {
      logger.debug('设置全局变量：', { key, value: webgalStore.getState().userData.globalGameVar[key] });
      dumpToStorageFast();
    } else {
      logger.debug('设置变量：', { key, value: webgalStore.getState().stage.GameVar[key] });
    }
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
};

export function getValueFromState(key: string) {
  let ret: number | string | boolean = 0;
  if (webgalStore.getState().stage.GameVar.hasOwnProperty(key)) {
    ret = webgalStore.getState().stage.GameVar[key];
  } else if (webgalStore.getState().userData.globalGameVar.hasOwnProperty(key)) {
    ret = webgalStore.getState().userData.globalGameVar[key];
  }
  return ret;
}
