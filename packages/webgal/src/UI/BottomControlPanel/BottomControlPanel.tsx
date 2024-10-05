import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState, webgalStore } from '@/store/store';
import { setMenuPanelTag, setVisibility, setshowFavorited } from '@/store/GUIReducer';

import { Scene, TitleSceneButtonKey } from '@/Core/UIConfigTypes';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { setStorage } from '@/Core/controller/storage/storageController';
import { saveGame } from '@/Core/controller/storage/saveGame';

import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';

import gamingContinueIcon from '@/assets/imgs/gaming-continue.png';
import gamingStopIcon from '@/assets/imgs/gaming-stop.png';

import styles from './bottomControlPanel.module.scss';
import { IPerform } from '@/Core/Modules/perform/performInterface';


export const BottomControlPanel = () => {
  const t = useTrans('gaming.');
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  const GUIStore = useSelector((state: RootState) => state.GUI);
  const stageState = useSelector((state: RootState) => state.stage);
  const debounceRef = useRef(false);

  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const [isPause, setIsPause] = useState<boolean>(false); // 是否暂停
  const [isPressing, setIsPressing] = useState<boolean>(false); // 是否长按

  const strokeWidth = 2.5;
  let pressTimer: any = null;

  const lang = i18n.language;
  const isFr = lang === 'fr';
  let size = 42;
  let fontSize = '150%';
  if (isFr) {
    fontSize = '125%';
    size = 40;
  }
 
  function isDisableClick() {
    // const guiStatus = webgalStore.getState().GUI;
    return !GUIStore.playingVideo
  }

  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  const saveData = useSelector((state: RootState) => state.saveData.saveData);
  let fastSlPreview = (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ fontSize: '125%' }}>{t('noSaving')}</div>
    </div>
  );
  if (saveData[0]) {
    const data = saveData[0];
    fastSlPreview = (
      <div className={styles.slPreviewMain}>
        <div className={styles.imgContainer}>
          <img style={{ height: '100%' }} alt="q-save-preview image" src={data.previewImage} />
        </div>
        <div className={styles.textContainer}>
          <div>{data.nowStageState.showName}</div>
          <div style={{ fontSize: '75%', color: 'rgb(55,60,56)' }}>{data.nowStageState.showText}</div>
        </div>
      </div>
    );
  }

  /**
   * 获取收藏快照索引
   */
  const getSnapshotIndex = async (): Promise<number> => {
    for (let page = 1; page <= 20; page++) {
      const start = (page - 1) * 10 + 1;
      const end = start + 9;
      await getSavesFromStorage(start, end);
      const snapshots = webgalStore.getState().saveData.saveData;
      // 检查当前页面的所有存档，找到第一个空位置的索引
      for (let i = 1; i < snapshots.length; i++) {
        const index = (page - 1) * 10 + i; // 计算全局索引
        if (!snapshots[i]) {
          // 假设没有数据的快照是undefined或null
          return index; // 找到第一个没有数据的索引并返回
        }
      }
    }
    // 如果所有页面都检查完了还没有找到空位置，则返回最后一个索引（即覆盖最后一个数据）
    return (20 - 1) * 10 + 9; // 最后一页的最后一个索引
  };

  /**
   * 收藏视频
   */
  const handleCollectVideo = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    playSeClick();
    if (GUIStore.showFavorited) {
      return;
    }
    dispatch(setshowFavorited(true));
    const index = await getSnapshotIndex();
    saveGame(index);
    setStorage();
  };

  /**
   * 长按逻辑
   */
  const handleMouseDown = (type: 'fallBack' | 'forward') => {
    if (isDisableClick()) return
    setIsPressing(true);

    const handleMouseUp = () => {
      setIsPressing(false);
      clearTimeout(pressTimer);
      clearInterval(pressTimer);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);

    pressTimer = setTimeout(() => {
      pressTimer = setInterval(() => {
        if (type === 'fallBack') {
          handleBack();
        } else if (type === 'forward') {
          handleForward();
        }
      }, 200);
    }, 500);
  };

  /**
   * 视频回退一秒
   */
  const handleBack = () => {
    if (!isPressing) {
      playSeClick();
    }
    const url = WebGAL.videoManager.currentPlayingVideo;
    WebGAL.videoManager.backward(url);
  };

  /**
   * 视频前进一秒
   */
  const handleForward = () => {
    if (isDisableClick()) return
    if (!isPressing) {
      playSeClick();
    }
    const url = WebGAL.videoManager.currentPlayingVideo;
    WebGAL.videoManager.forward(url);
  };

  /**
   * 视频暂停和播放
   */

  const handlePause = () => {
    if (isDisableClick()) return
    playSeClick();
    const url = WebGAL.videoManager.currentPlayingVideo;
    if (isPause) {
      setIsPause(false);
      WebGAL.videoManager.playVideo(url);
    } else {
      setIsPause(true);
      WebGAL.videoManager.pauseVideo(url);
    }
  };

  /**
   * 跳过当前视频
   * 先销毁当前视频，然后执行下一条语句
   */
  const handleSkip = () => {
    if (isDisableClick()) return
    let isNext = true;
    let currentVideoPerformName = '';
    WebGAL.gameplay?.performController?.performList?.forEach((e) => {
      // 如果当前语句是选择语句，则不跳过
      if (e.performName === 'choose') {
        isNext = false;
      } else if (e.performName.startsWith('videoPlay.')) {
        currentVideoPerformName = e.performName;
      }
    });

    if (!isNext) {
      return;
    }

    if (debounceRef.current) return;
    debounceRef.current = true;

    playSeClick();

    if (currentVideoPerformName) {
      WebGAL.gameplay.performController.unmountPerform(currentVideoPerformName);
    }

    nextSentence();
    setTimeout(() => {
      debounceRef.current = false;
    }, 2500);
  };

  /**
   * 是否显示 收藏按钮，根据菜单配置 是否隐藏鉴赏
   * @return {boolean} 是否展示按钮
   */
  const isShowCollectedBtn = () => {
    const menu = GUIStore.gameUIConfigs[Scene.title]?.buttons[TitleSceneButtonKey.Game_extra_button];
    if (!menu || menu.args.hide) return false;
    return true;
  };

    
  if (GUIStore.isHideGameUI) {
    return null
  }


  return (
    <>
      {GUIStore.showTextBox && stageState.enableFilm === '' && (
        <div 
          className={styles.main} 
          style={{ visibility: GUIStore.controlsVisibility ? 'visible' : 'hidden' }}
        >
          <span
            className={`${styles.fallBack} interactive`}
            onMouseEnter={playSeEnter}
            onClick={() => {
              if (isDisableClick()) return
              handleBack();
            }}
            onMouseDown={() => handleMouseDown('fallBack')}
          />
          <span 
            className={`${styles.pause} interactive`} 
            onMouseEnter={playSeEnter} 
            onClick={handlePause}
          >
            <img 
              src={isPause ? gamingStopIcon : gamingContinueIcon} 
              className={styles.icon} 
            />
          </span>
          <span
            className={`${styles.advance} interactive`}
            onMouseEnter={playSeEnter}
            onClick={handleForward}
            onMouseDown={() => handleMouseDown('forward')}
          />

          {!webgalStore.getState().saveData.isLoadVideo && (
            <span 
              className={`${styles.autoplay} interactive`} 
              onMouseEnter={playSeEnter} 
              onClick={handleSkip} 
            /> 
          )}

          {isShowCollectedBtn() && (
            <span
              className={`${styles.singleButton} interactive`}
              style={{ fontSize }}
              onClick={handleCollectVideo}
              onMouseEnter={playSeEnter}
            >
              <span className={styles.button_icon} />
              <span className={styles.button_text}>
                {t(`${GUIStore.showFavorited ? 'buttons.collected' : 'buttons.collection'}`)}
              </span>
            </span>
          )}
        </div>
      )}
    </>
  );
};
