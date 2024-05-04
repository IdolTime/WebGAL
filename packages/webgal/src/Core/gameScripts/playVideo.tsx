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

  sentence.args.forEach((e) => {
    if (e.key === 'choose') {
      chooseContent = 'choose:' + (e.value as string);
    }
    if (e.key === 'loop') {
      loopValue = e.value === true;
    }
  });

  let blockingNext = getSentenceArgByKey(sentence, 'skipOff');
  let blockingNextFlag = false;
  if (blockingNext || loopValue || chooseContent !== '') {
    blockingNextFlag = true;
  }

  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <div className={styles.videoContainer}>
      <video className={styles.fullScreen_video} id="playVideoElement" src={sentence.content} autoPlay={true} />
    </div>,
    document.getElementById('videoContainer'),
  );
  let isOver = false;
  const performObject = {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => blockingNextFlag,
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
        let VocalControl: any = document.getElementById('playVideoElement');
        if (VocalControl !== null) {
          VocalControl.currentTime = 0;
          VocalControl.volume = bgmVol;
          VocalControl.loop = loopValue;

          const endPerform = () => {
            for (const e of WebGAL.gameplay.performController.performList) {
              if (e.performName === performInitName) {
                if (chooseContent !== '' && !loopValue) {
                  const parsedResult = sceneParser(chooseContent, 'temp.txt', '');
                  const duration = VocalControl.duration;
                  VocalControl.currentTime = duration - 0.03;
                  VocalControl.pause();
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
          const skipVideo = () => {
            console.log('skip');
            endPerform();
          };
          // 双击可跳过视频
          WebGAL.events.fullscreenDbClick.on(skipVideo);
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
              // eslint-disable-next-line react/no-deprecated
              ReactDOM.render(<div />, document.getElementById('videoContainer'));
            },
            blockingNext: () => blockingNextFlag,
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

          VocalControl?.play();

          if (chooseContent && loopValue) {
            const parsedResult = sceneParser(chooseContent, 'temp.txt', '');
            const script = parsedResult.sentenceList[0];
            const perform = choose(script, endPerform);
            WebGAL.gameplay.performController.arrangeNewPerform(perform, script);
          }

          VocalControl.onended = () => {
            endPerform();
          };
        }
      }, 1);
    }),
  };

  return performObject;
};
