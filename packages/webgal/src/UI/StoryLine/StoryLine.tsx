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

/**
 * 故事线页面
 * @constructor
 */
export const StoryLine: FC = () => {
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const StageState = useSelector((state: RootState) => state.stage);
  const unlockStorylineList = useSelector((state: RootState) => state.saveData.unlockStorylineList);

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

  return (
    <>
      {GUIState.showStoryLine && (
        <div className={styles.storyLine}>
          <div className={styles.storyLine_header}>
            <span className={styles.goBack} onClick={handlGoBack}>
              返回
            </span>
            <span className={styles.title}>故事线</span>
          </div>
          <div
            className={styles.storyLine_content}
            style={{
              width: StageState.storyLineBgX,
              backgroundImage: `url("${StageState.storyLineBg}")`,
              backgroundSize:
                StageState.storyLineBgX &&
                StageState.storyLineBgY &&
                `${StageState.storyLineBgX} ${
                  StageState.storyLineBgY.includes('1080') ? '100%' : StageState.storyLineBgY
                }`,
            }}
          >
            {unlockStorylineList?.map((item: ISaveStoryLineData, index) => {
              const { name, thumbnailUrl, x, y, isUnlock } = item.storyLine;

              if (!isUnlock) {
                return null;
              }

              return (
                <div
                  key={`storyLine-${index}`}
                  className={styles.storyLine_item}
                  style={
                    thumbnailUrl ? { top: `${y}px`, left: `${x}px`, backgroundImage: `url("${thumbnailUrl}")` } : {}
                  }
                  onClick={(e) => handlPlay(e, item)}
                >
                  <div className={styles.info_card}>
                    <span className={styles.playButton_icon} />
                    <span className={styles.name}>{name}</span>
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
