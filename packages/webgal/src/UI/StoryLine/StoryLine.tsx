import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setShowStoryLine } from '@/store/GUIReducer';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import styles from './storyLine.module.scss';

/**
 * 故事线页面
 * @constructor
 */
export const StoryLine: FC = () => {
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const StageState = useSelector((state: RootState) => state.stage);

  /**
   * 返回
   */
  const handlGoBack = () => {
    backToTitle()
    dispatch(setShowStoryLine(false));
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
            style={{ backgroundImage: `url("${StageState.storyLineBg}")` }}
          ></div>
        </div>
      )}
    </>
  );
};

export default StoryLine;
