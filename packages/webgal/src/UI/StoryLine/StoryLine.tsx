import React, { CSSProperties, FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setShowStoryLine, setVisibility } from '@/store/GUIReducer';
import { ISaveStoryLineData, ISaveData } from '@/store/userDataInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { getStorylineFromStorage } from '@/Core/controller/storage/savesController';
import styles from './storyLine.module.scss';
import { saveActions } from '@/store/savesReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2, parseStyleArg } from '@/Core/parser/utils';
import { Scene, StorylineSceneUIConfig } from '@/Core/UIConfigTypes';
import { Button } from '../Components/Base';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { sceneNameType } from '@/Core/Modules/scene';
import { sceneParser } from '@/Core/parser/sceneParser';
import { SourceImg } from '../Components/SourceImg';

interface IStoryLinStageItem {
  storylineBg: string;
  storylineBgX: number;
  storylineBgY: number;
}

const defaultStoryLinStageItem: IStoryLinStageItem = {
  storylineBg: '',
  storylineBgX: 1280,
  storylineBgY: 720,
};

/**
 * 故事线页面
 * @constructor
 */
export const StoryLine: FC = () => {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const StageState = useSelector((state: RootState) => state.stage);
  const saveData = useSelector((state: RootState) => state.saveData);
  const unlockStorylineList = useSelector((state: RootState) => state.saveData.allStorylineData);
  const storylineUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.storyline],
  ) as StorylineSceneUIConfig;

  const storylineUIItem = storylineUIConfigs.other.Storyline_item;

  const [achieveStage, setAchieveStage] = useState<IStoryLinStageItem>(defaultStoryLinStageItem);

  useEffect(() => {
    getStorylineFromStorage();
    if (GUIState.showStoryLine) {
      dispatch(saveActions.setShowStoryline(false));
      initStoryline();
    }
  }, [GUIState.showStoryLine]);

  async function initStoryline() {
    // 初始化成就场景
    const sceneUrl: string = assetSetter(sceneNameType.Storyline, fileType.scene);
    const rawScene = await sceneFetcher(sceneUrl);

    const currentScene = sceneParser(rawScene, sceneNameType.Storyline, sceneUrl);
    const sentenceList = currentScene.sentenceList;

    if (sentenceList?.length > 0 && sentenceList[0]?.commandRaw === 'changeBg') {
      const storylineBg = sentenceList[0]?.content ?? '';

      let storylineBgX = 1280;
      let storylineBgY = 720;

      const gameSizeStr = window.localStorage.getItem('game-screen-size');
      const sizeArr = gameSizeStr?.split('x') ?? [];

      if (sizeArr?.length > 0 && sizeArr[0] === '1920') {
        storylineBgX = Number(sizeArr[0]);
        storylineBgY = Number(sizeArr[1]);
      }

      sentenceList[0]?.args?.forEach((arg) => {
        if (arg?.key === 'x') {
          storylineBgX = Number(arg?.value);
        } else if (arg?.key === 'y') {
          storylineBgY = Number(arg?.value);
        }
      });

      setAchieveStage({
        storylineBg,
        storylineBgX,
        storylineBgY,
      });
    }
  }

  /**
   * 返回
   */
  const handlGoBack = () => {
    backToTitle();
    dispatch(setShowStoryLine(false));
  };

  /**
   * 播放故事线
   * 1. 在播放完视频后，如果下一个是解锁故事线，则在解锁故事线数据中 保存上一个视频相关数据；
   * 2. 点击按钮播放时，从当前缓存中取出数，截取start.txt, 从当前开始数据播放，参考读档/存档功能；
   */
  const handlPlay = (e: React.MouseEvent, saveData: ISaveStoryLineData) => {
    e.stopPropagation();
    dispatch(setShowStoryLine(false));
    dispatch(saveActions.setIsShowUnlock(true));
    dispatch(setVisibility({ component: 'showProgressAndAchievement', visibility: false }));
    loadGameFromStageData(saveData.videoData as ISaveData).finally(() => {
      // @ts-ignore
      window?.pubsub?.publish('loading', { loading: false });
    });
  };

  function getImagePath(url: string) {
    return assetSetter(url, fileType.ui);
  }

  const hasBGImage = !!StageState.storyLineBg;
  const bgStyle =
    typeof achieveStage.storylineBgX === 'number' && typeof achieveStage.storylineBgY === 'number'
      ? {
          width: px2(achieveStage.storylineBgX),
          height: px2(achieveStage.storylineBgY),
          maxWidth: 'none',
        }
      : { maxWidth: 'none' };

  return (
    <>
      {GUIState.showStoryLine && (
        <div className={styles.storyLine} id="camera" style={hasBGImage ? { backgroundImage: 'none' } : {}}>
          {!GUIState.showProgressAndAchievement && (
            <Button
              item={storylineUIConfigs.buttons.Storyline_back_button}
              defaultClass={`
              ${styles.goBack} 
              ${storylineUIConfigs.buttons.Storyline_back_button?.args?.style?.image ? styles.hideDefalutGobackBg : ''} 
              interactive`}
              onClick={handlGoBack}
              onMouseEnter={playSeEnter}
            />
          )}
          <SourceImg src={achieveStage.storylineBg} style={bgStyle} />
          {unlockStorylineList?.map((item: ISaveStoryLineData, index) => {
            const { name, thumbnailUrl, x, y, isUnlock, isHideName } = item.storyLine;

            if (!isUnlock) return null;

            let styleObj = parseStyleArg(storylineUIItem.args.style) || {};
            let nameStyle: CSSProperties = {};

            if (styleObj?.fontSize) nameStyle.fontSize = styleObj.fontSize;
            if (styleObj?.color) nameStyle.color = styleObj.color;

            if (thumbnailUrl) {
              styleObj = {
                ...styleObj,
                position: 'absolute',
                top: `${px2(y)}px`,
                left: `${px2(x)}px`,
              };
            }

            let sourceImgStyle: CSSProperties = {};

            if (styleObj?.width) {
              sourceImgStyle.width = styleObj.width;
            }

            if (styleObj?.height) {
              sourceImgStyle.height = styleObj.height;
            }

            return (
              <div
                key={`storyLine-${index}`}
                className={`${styles.storyLine_item} interactive`}
                style={styleObj}
                onClick={(e) => {
                  // @ts-ignore
                  window?.pubsub?.publish('loading', { loading: true });
                  setTimeout(() => {
                    handlPlay(e, item)
                  }, 200);
                }}
              >
                <SourceImg src={getImagePath(thumbnailUrl)} style={sourceImgStyle} />
                <div className={styles.info_card}>
                  <span className={styles.playButton_icon} style={{ width: isHideName ? '100%' : '50%' }} />
                  {isHideName ? null : (
                    <span className={styles.name} style={nameStyle}>
                      {name}
                    </span>
                  )}
                </div>
              </div>
            );
          }) ?? null}
        </div>
      )}
    </>
  );
};

export default StoryLine;
