import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import styles from './achievement.module.scss';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { getUnlickAchieveFromStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';

/**
 * 成就页面
 * @constructor
 */
export const Achievement: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
  const StageState = useSelector((state: RootState) => state.stage);
  const saveData = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const [unlockedData, setUnlockedData] = useState({ 
    unlocked: 0, 
    allTotal: 0,
    currentProgress: '0%'
});


  
  useEffect(() => {
    
    if (GUIState.showAchievement) {
      // 控制解锁成就显示，当开始游戏后才可解锁
      webgalStore.dispatch(saveActions.setIsShowUnlock(false));
      setTimeout(() => {
        initData()
      }, 10)
    }
    
  }, [GUIState.showAchievement]);

  async function initData() {
    await getUnlickAchieveFromStorage()

    const currentScene = WebGAL.sceneManager.sceneData.currentScene  
    const unlocked = webgalStore.getState().saveData.unlockAchieveData?.length ?? 0; 
    const allTotal = webgalStore.getState().saveData.unlockAchieveAllTotal || 0;
    // 当前完成进度
    const currentProgress  = ((unlocked / allTotal) * 100).toFixed(2) + '%';

    setUnlockedData({ unlocked, allTotal, currentProgress })
  }


  /**
   * 返回
   */
  const handleGoBack = () => {
    backToTitle();
    dispatch(setVisibility({ component: 'showAchievement', visibility: false }));
  };

  return (
    <>
      {GUIState.showAchievement && (
        <div className={styles.achievement}>
          {/* 头部 */}
          <div className={styles.achievement_header}>
            <span className={styles.goback} onClick={handleGoBack}>
              返回
            </span>
            <span className={styles.title}>成就</span>
          </div>

          {/* 已获得成就  */}
          <div className={styles.achievement_content}>
            <div className={styles.achievement_current}>
              <span className={styles.text}>已获得成就</span>
              <span className={styles.number}>{`${unlockedData.unlocked}/${unlockedData.allTotal}`}</span>
              <span className={styles.pregessBar}>
                <span className={styles.pregressBar_inner} style={{ width: unlockedData.currentProgress }}></span>
              </span>
            </div>
          </div>

          {/* 内容部分 */}
          <div 
            className={styles.achievement_content_bg}
            style={{ 
              width: StageState.achieveBgX,
              backgroundImage: `url("${StageState.achieveBg}")`,
              backgroundSize: StageState.achieveBgX && StageState.achieveBgY && `${StageState.achieveBgX} ${StageState.achieveBgY}`
            }}  
          >
            {saveData.unlockAchieveData?.length > 0 && (
              <div className={styles.achievement_list}>
                {saveData.unlockAchieveData?.map(({ unlockname, x, y, url, isShow, saveTime }, index) => {
                  if (!isShow) {
                    return null;
                  }
                  return (
                    <div
                      key={`unlockAchieveItem-${index}`}
                      className={styles.achievement_item}
                      style={url ? { top: `${y}px`, left: `${x}px`, backgroundImage: `url("${url}")` } : {}}
                    >
                      {/* <span>{unlockname}</span> */}
                      <div className={styles.ripple}></div>

                      {/* 信息详情卡片 */}
                      <div className={styles.info_card}>
                        <span className={styles.unlockname}>{unlockname}</span>
                        <span className={styles.time}>{`${saveTime}达成`}</span>
                        <span className={styles.description}>55% 玩家已达成</span>
                      </div>
                    </div>
                  );
                }) ?? null}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
