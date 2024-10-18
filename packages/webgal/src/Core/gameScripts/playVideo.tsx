import { arg, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { getRandomPerformName, PerformController } from '@/Core/Modules/perform/performController';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/Core/WebGAL';
import { choose } from './choose';
import { sceneParser } from '../parser/sceneParser';
import { scenePrefetcher } from '@/Core/util/prefetcher/scenePrefetcher';
import { getCurrentVideoStageDataForStoryLine } from '@/Core/controller/storage/saveGame';
import { setshowFavorited, setVisibility } from '@/store/GUIReducer';
import { updateShowValueList, setStage } from '@/store/stageReducer';
import { assetSetter, fileType } from '../util/gameAssetsAccess/assetSetter';

/**
 * 播放一段视频 * @param sentence
 */
export const playVideo = (sentence: ISentence): IPerform => {
  const userDataState = webgalStore.getState().userData;
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  let keepVideo = false;
  let chooseContent = '';
  let loopValue = false;
  let continueBgmValue = false;
  let hideVideo = sentence.content === 'none' || sentence.content === '';
  let id = '';
  const optionId = Date.now();
  webgalStore.dispatch(setshowFavorited(false));
  webgalStore.dispatch(setStage({ key: 'showText', value: '' }));
  webgalStore.dispatch(setStage({ key: 'showName', value: '' }));
  webgalStore.dispatch(setVisibility({ component: 'showTextBox', visibility: false }));
  const endPerformRef = {
    current: () => {
      console.log('快进状态尝试跳过视频');
    },
  };
  let poster = '';

  sentence.args.forEach((e) => {
    if (e.key === 'choose') {
      chooseContent = 'choose:' + (e.value as string);
    }
    if (e.key === 'continueBgm') {
      continueBgmValue = e.value === true;
    }
    if (e.key === 'loop') {
      loopValue = e.value === true;
    } else if (e.key === 'keep') {
      keepVideo = e.value === true;
      loopValue = true;
    } else if (e.key === 'id') {
      id = e.value as string;
    } else if (e.key === 'poster') {
      poster = assetSetter(e.value as string, fileType.image);
    }
  });

  if (id && !hideVideo) {
    WebGAL.videoManager.setUrlIdMap(id, sentence.content);
  }

  const performInitName: string = 'videoPlay.' + (id || getRandomPerformName());

  if (hideVideo) {
    if (!id) {
      WebGAL.videoManager.destroy(WebGAL.videoManager.currentPlayingVideo);
    } else {
      const url = WebGAL.videoManager.idURLMap[id];

      if (url) {
        WebGAL.videoManager.destroy(url);
      }
    }

    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined,
    };
  } else {
    if (poster) {
      WebGAL.videoManager.setPoster(sentence.content, poster);
    }
  }

  const checkIfBlockingNext = () => {
    let blockingNext = getSentenceArgByKey(sentence, 'skipOff');
    let blockingNextFlag = true; // 暂时不允许跳过
    let isFast = WebGAL.gameplay.isFast;
    if (isFast) {
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

    if (keepVideo) {
      blockingNextFlag = false;
    }

    return blockingNextFlag;
  };

  WebGAL.videoManager.showVideo(sentence.content, keepVideo);

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
        // e.stopFunction();
        WebGAL.gameplay.performController.unmountPerform(e.performName);
      };

      /**
       * 启动视频播放
       */
      setTimeout(() => {
        const url = sentence.content;
        const isLoadVideo = webgalStore.getState().saveData.isLoadVideo;
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
          // 如果为鉴赏模式下播放视频，播放完后自动跳转到鉴赏模式页面
          if (isLoadVideo) {
            webgalStore.dispatch(setVisibility({ component: 'showExtra', visibility: true }));
            return;
          }

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
          duration: keepVideo ? 0 : 1000 * 60 * 60 * 24 * 3650,
          isOver: false,
          isHoldOn: false,
          stopFunction: (noWait = false) => {
            // WebGAL.events.fullscreenDbClick.off(skipVideo);

            // if (!continueBgmValue) {
            /**
             * 恢复音量
             * 需求变更：bgm与视频同时播放，不被视频打断
             */
            // const bgmElement: any = document.getElementById('currentBgm');
            // if (bgmElement) {
            //   bgmElement.volume = bgmVol.toString();
            // }
            // }

            if (!keepVideo) {
              const vocalElement: any = document.getElementById('currentVocal');
              if (vocalElement) {
                vocalElement.volume = vocalVol.toString();
              }

              WebGAL.videoManager.destroy(url, noWait);
            }
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
         * 需求变更：bgm与视频同时播放，不被视频打断
         */
        // if (!continueBgmValue) {
        // const bgmVol2 = 0;
        // const bgmElement: any = document.getElementById('currentBgm');
        // if (bgmElement) {
        //   bgmElement.volume = bgmVol2.toString();
        // }
        // }

        if (!keepVideo) {
          const vocalVol2 = 0;
          const vocalElement: any = document.getElementById('currentVocal');
          if (vocalElement) {
            vocalElement.volume = vocalVol2.toString();
          }
        }

        WebGAL.videoManager.playVideo(url);
        // 从缓存数据中查找 改视频是否收藏过
        const saveData = webgalStore.getState().saveData.saveData || [];
        if (saveData?.length) {
          saveData.forEach((item: any) => {
            item?.nowStageState?.PerformList?.forEach((item2: any) => {
              if (item2?.script?.content === url) {
                setTimeout(() => {
                  webgalStore.dispatch(setshowFavorited(true));
                });
              }
            });
          });
        }

        if (chooseContent && loopValue) {
          const parsedResult = sceneParser(chooseContent, `${optionId}.txt`, '');
          const script = parsedResult.sentenceList[0];
          const perform = choose(script, endPerform);
          WebGAL.gameplay.performController.arrangeNewPerform(perform, script);
        }

        setTimeout(() => {
          // 延迟一秒 获取当前视频播放信息，用于故事线信息存储
          getCurrentVideoStageDataForStoryLine();
        }, 1000);

        WebGAL.videoManager.onEnded(url, () => {
          // getCurrentVideoStageDataForStoryLine();
          if (loopValue) {
            WebGAL.videoManager.seek(url, 0.03);
            WebGAL.videoManager.playVideo(url);
          } else {
            // 视频播放完成后，隐藏当前设置的显示变量
            const showValueList = webgalStore.getState().stage.showValueList;
            if (showValueList?.length) {
              const name = webgalStore.getState().stage.showValueName;
              const newShowValueList = showValueList.filter((item) => item.showValueName !== name);
              webgalStore.dispatch(updateShowValueList(newShowValueList));
            }

            endPerform();
          }
        });
      }, 100);
    }),
  };

  return performObject;
};
