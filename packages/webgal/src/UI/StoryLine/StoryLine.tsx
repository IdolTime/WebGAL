import { FC, useEffect } from 'react';
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
import { px2 } from '@/Core/parser/utils';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

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


  useEffect(() => {
    getStorylineFromStorage()
    if (GUIState.showStoryLine) {
      dispatch(saveActions.setShowStoryline(false));
    }
  }, [GUIState.showStoryLine])

  /**
   * 返回
   */
  const handlGoBack = () => {
    playSeClick()
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
    loadGameFromStageData(saveData.videoData as ISaveData);
  };

  function getImagePath(url: string) {
    return assetSetter(url, fileType.ui);
  }

  return (
    <>
      {GUIState.showStoryLine && (
        <div className={styles.storyLine}>
          <div className={styles.storyLine_header}>
            <span 
              className={styles.goBack} 
              onClick={handlGoBack}
              onMouseEnter={playSeEnter}
            >
              {/* 返回 */}
            </span>
          </div>
          <div
            className={styles.storyLine_content}
            style={{
              width: StageState.storyLineBgX ? px2(StageState.storyLineBgX) + 'px' : '100%',
              height: Number(StageState.storyLineBgY) > 720 ? px2(StageState.storyLineBgY) + 'px' : '100%',
              backgroundImage: `url("${StageState.storyLineBg}")`,
              backgroundSize: StageState.storyLineBgX && StageState.storyLineBgY && `${px2(StageState.storyLineBgX)}px ${px2(StageState.storyLineBgY)}px`            
            }}
          >
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
                      ? { top: `${y}px`, left: `${x}px`, backgroundImage: `url("${getImagePath(thumbnailUrl)}")` } 
                      : {}
                  }
                  onClick={(e) => handlPlay(e, item)}
                >
                  <div className={styles.info_card}>
                    <span className={styles.playButton_icon} style={{ width: isHideName ? '100%' : '50%' }} />
                    {isHideName ? null : <span className={styles.name}>{name}</span>}
                  </div>
                </div>
              );
            }) ?? null}
          </div>
        </div>
      )}
    </>
  );
};

export default StoryLine;
