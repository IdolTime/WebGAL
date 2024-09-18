import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setShowStoryLine } from '@/store/GUIReducer';
import { ISaveStoryLineData, ISaveData } from '@/store/userDataInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { getStorylineFromStorage } from '@/Core/controller/storage/savesController';
import styles from './storyLine.module.scss';
import { saveActions } from '@/store/savesReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2 } from '@/Core/parser/utils';
import { Scene, StorylineSceneUIConfig } from '@/Core/UIConfigTypes';
import { Button } from '../Components/Base';
import { SourceImg } from '../Components/SourceImg';

/**
 * 故事线页面
 * @constructor
 */
export const StoryLine: FC = () => {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const StageState = useSelector((state: RootState) => state.stage);
  const unlockStorylineList = useSelector((state: RootState) => state.saveData.allStorylineData);
  const storylineUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.storyline],
  ) as StorylineSceneUIConfig;

  useEffect(() => {
    getStorylineFromStorage();
    if (GUIState.showStoryLine) {
      dispatch(saveActions.setShowStoryline(false));
    }
  }, [GUIState.showStoryLine]);

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
    loadGameFromStageData(saveData.videoData as ISaveData);
  };

  function getImagePath(url: string) {
    return assetSetter(url, fileType.ui);
  }

  const hasBGImage = !!StageState.storyLineBg;
  const bgStyle =
    typeof StageState.storyLineBgX === 'number' && typeof StageState.storyLineBgY === 'number'
      ? {
          width: px2(StageState.storyLineBgX),
          height: px2(StageState.storyLineBgY),
        }
      : {};

  return (
    <>
      {GUIState.showStoryLine && (
        <div className={styles.storyLine} style={hasBGImage ? { backgroundImage: 'none' } : {}} id="camera">
          <Button
            item={storylineUIConfigs.buttons.Storyline_back_button}
            defaultClass={`
              ${styles.goBack} 
              ${storylineUIConfigs.buttons.Storyline_back_button?.args?.style?.image ? styles.hideDefalutGobackBg : ''} 
              interactive`}
            onClick={handlGoBack}
            onMouseEnter={playSeEnter}
          />
          <SourceImg src={StageState.storyLineBg} style={bgStyle} />
          {unlockStorylineList?.map((item: ISaveStoryLineData, index) => {
            const { name, thumbnailUrl, x, y, isUnlock, isHideName } = item.storyLine;

            if (!isUnlock) {
              return null;
            }

            return (
              <div
                key={`storyLine-${index}`}
                className={styles.storyLine_item}
                style={
                  thumbnailUrl
                    ? {
                        top: `${px2(y)}px`,
                        left: `${px2(x)}px`,
                      }
                    : {}
                }
                onClick={(e) => handlPlay(e, item)}
              >
                <SourceImg src={getImagePath(thumbnailUrl)} />
                <div className={styles.info_card}>
                  <span className={styles.playButton_icon} style={{ width: isHideName ? '100%' : '50%' }} />
                  {isHideName ? null : <span className={styles.name}>{name}</span>}
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
