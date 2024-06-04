import { arg, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '@/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { getRandomPerformName, PerformController } from '@/Core/Modules/perform/performController';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/Core/WebGAL';
import { choose } from './choose';
import { sceneParser } from '../parser/sceneParser';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';
import { current } from '@reduxjs/toolkit';

/**
 * 播放一段视频 * @param sentence
 */
export const playVideo = (sentence: ISentence): IPerform => {
  const userDataState = webgalStore.getState().userData;
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  const performInitName: string = getRandomPerformName();
  let chooseContent = '';
  let loopValue = false;
  const optionId = Date.now();
  const endPerformRef = {
    current: () => {
      console.log('尝试跳过视频');
    },
  };

  sentence.args.forEach((e) => {
    if (e.key === 'choose') {
      chooseContent = 'choose:' + (e.value as string);
    }
    if (e.key === 'loop') {
      loopValue = e.value === true;
    }
  });

  const checkIfBlockingNext = () => {
    let blockingNext = getSentenceArgByKey(sentence, 'skipOff');
    // 影游编辑器不允许跳过
    let blockingNextFlag = true;
    let isFast = WebGAL.gameplay.isFast && WebGAL.gameplay.isSyncingWithOrigine;
    if (isFast) {
      blockingNextFlag = false;
      if (blockingNext) {
        blockingNextFlag = true;
      }
      if (loopValue) {
        blockingNextFlag = false;
      }
      if (chooseContent !== '') {
        blockingNextFlag = true;
        endPerformRef.current();
      }
    } else {
      if (blockingNext || loopValue || chooseContent !== '') {
        blockingNextFlag = true;
      }
    }

    return blockingNextFlag;
  };

  WebGAL.videoManager.showVideo(sentence.content);

  let isOver = false;
  const performObject = {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: checkIfBlockingNext,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    arrangePerformPromise: new Promise<IPerform>((resolve) => {
      const endCallback = (e: IPerform) => {
        isOver = true;
        e.stopFunction();
        WebGAL.gameplay.performController.unmountPerform(e.performName);
      };

      /**
       * 启动视频播放
       */
      setTimeout(() => {
        const url = sentence.content;
        WebGAL.videoManager.seek(url, 0.03);
        WebGAL.videoManager.setVolume(url, bgmVol);
        WebGAL.videoManager.setLoop(url, loopValue);
        const sceneList = chooseContent
          ? chooseContent
              .slice(7)
              .split('|')
              .map((x) => 'game/scene/' + x.split(':')[1])
          : [];

        if (sceneList.length) {
          scenePrefetcher(sceneList);
        }

        const endPerform = () => {
          for (const e of WebGAL.gameplay.performController.performList) {
            if (e.performName === performInitName) {
              if (chooseContent !== '' && !loopValue) {
                const parsedResult = sceneParser(chooseContent, `${optionId}.txt`, '');

                const duration = WebGAL.videoManager.getDuration(url);
                WebGAL.videoManager.seek(url, (duration || 0) - 0.03);
                WebGAL.videoManager.pauseVideo(url);

                const script = parsedResult.sentenceList[0];
                const perform = choose(script, () => {
                  endCallback(e);
                });
                WebGAL.gameplay.performController.arrangeNewPerform(perform, script);
              } else {
                endCallback(e);
                nextSentence();
              }
            }
          }
        };
        endPerformRef.current = endPerform;
        const skipVideo = () => {
          console.log('skip');
          endPerform();
        };
        // 双击可跳过视频
        // WebGAL.events.fullscreenDbClick.on(skipVideo);
        // 播放并作为一个特别演出加入
        const perform = {
          performName: performInitName,
          duration: 1000 * 60 * 60,
          isOver: false,
          isHoldOn: false,
          stopFunction: () => {
            WebGAL.events.fullscreenDbClick.off(skipVideo);
            /**
             * 恢复音量
             */
            const bgmElement: any = document.getElementById('currentBgm');
            if (bgmElement) {
              bgmElement.volume = bgmVol.toString();
            }
            const vocalElement: any = document.getElementById('currentVocal');
            if (bgmElement) {
              vocalElement.volume = vocalVol.toString();
            }

            WebGAL.videoManager.destroy(url);
          },
          blockingNext: checkIfBlockingNext,
          blockingAuto: () => {
            return !isOver;
          },
          stopTimeout: undefined, // 暂时不用，后面会交给自动清除
          goNextWhenOver: true,
        };
        resolve(perform);
        /**
         * 把bgm和语音的音量设为0
         */
        const vocalVol2 = 0;
        const bgmVol2 = 0;
        const bgmElement: any = document.getElementById('currentBgm');
        if (bgmElement) {
          bgmElement.volume = bgmVol2.toString();
        }
        const vocalElement: any = document.getElementById('currentVocal');
        if (bgmElement) {
          vocalElement.volume = vocalVol2.toString();
        }

        WebGAL.videoManager.playVideo(url);

        if (chooseContent && loopValue) {
          const parsedResult = sceneParser(chooseContent, `${optionId}.txt`, '');
          const script = parsedResult.sentenceList[0];
          const perform = choose(script, endPerform);
          WebGAL.gameplay.performController.arrangeNewPerform(perform, script);
        }

        WebGAL.videoManager.onEnded(url, () => {
          if (loopValue) {
            WebGAL.videoManager.seek(url, 0.03);
            WebGAL.videoManager.playVideo(url);
          } else {
            endPerform();
          }
        });
      }, 100);
    }),
  };

  return performObject;
};
