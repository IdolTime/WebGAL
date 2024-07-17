import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import styles from './achievement.module.scss';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { getUnlickAchieveFromStorage, dumpUnlickAchieveToStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';
import { IUnlockAchieveItem } from '@/store/stageInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher'
import { sceneNameType } from '@/Core/Modules/scene'
import useSoundEffect from '@/hooks/useSoundEffect';

/**
 * 成就页面
 * @constructor
 */
export const Achievement: FC = () => {
  const { playSeClick, playSeEnter } = useSoundEffect();
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
      initAhieve()
    }
    
  }, [GUIState.showAchievement]);

  async function initAhieve() {
    // 初始化成就场景
    const sceneUrl: string = assetSetter(sceneNameType.Achieve, fileType.scene);
    const rawScene = await sceneFetcher(sceneUrl)
    await WebGAL.sceneManager.setCurrentScene(rawScene, sceneNameType.Achieve, sceneUrl);
      
    setTimeout(() => {
      initData()
    }, 100)
  }

  async function initData() {
    // await getUnlickAchieveFromStorage()
    const allUnlockAchieveList = webgalStore.getState().saveData.allUnlockAchieveList;
    
    const unlocked = webgalStore.getState().saveData.unlockAchieveData?.length ?? 0; 
    const allTotal = allUnlockAchieveList.length || 0;
    // 当前完成进度
    const currentProgress  = ((unlocked / allTotal) * 100).toFixed(2) + '%';
    setUnlockedData({ unlocked, allTotal, currentProgress })
  }

  /**
   * 获得解锁成就图标完整地址
   * @param url {string} 图标名称
   * @returns {string} 完整地址路径
   */
  const getUrl = (url: string) => {
    return assetSetter(url, fileType.ui)
  }

  /**
   * 判断当前图标是否在背景图边缘位置
   * @returns {boolean} true: 在边缘 false: 不在边缘
   */
  const isEdge = (IconX: number, achieveBgX: string) => {
    let num = parseFloat(achieveBgX?.replace(/[^0-9.]/g, ''));
    const infoCardWidth = 500
    const totalX = IconX + infoCardWidth;
    if (totalX >= num) {
      return true
    }
    return false
  } 
  
  /**
   * 判断当前图标是否在背景图边缘位置
   */
  const getPositionX = (x: number, achieveBgX: string) => {
    let num = parseFloat(achieveBgX?.replace(/[^0-9.]/g, ''));
    if (x >= num) {
      return num - 100
    }
    return x
  }


  /**
   * 返回
   */
  const handleGoBack = () => {
    playSeClick()
    backToTitle();
    dispatch(setVisibility({ component: 'showAchievement', visibility: false }));
  };

  return (
    <>
      {GUIState.showAchievement && (
        <div className={styles.achievement}>
          {/* 头部 */}
          <div className={styles.achievement_header}>
            <span 
              className={styles.goback} 
              onClick={handleGoBack} 
              onMouseEnter={playSeEnter}
            >
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
              backgroundSize: StageState.achieveBgX && StageState.achieveBgY && `${StageState.achieveBgX} ${StageState.achieveBgY.includes('720') ? '100%' : StageState.achieveBgY}`
            }}  
          >
            {saveData.allUnlockAchieveList?.length > 0 && (
              <div className={styles.achievement_list}>
                {saveData.allUnlockAchieveList?.map(
                  ({ unlockname, x, y, url, isShowUnlock, saveTime, condition }, index) => {
                  return (
                    <div
                      key={`unlockAchieveItem-${index}`}
                      className={`${styles.achievement_item } ${isShowUnlock ? styles.achievement_item_bg_active : ''}`}
                      style={{ top: `${y}px`, left: `${getPositionX(x, StageState.achieveBgX)}px`, backgroundImage: `url("${isShowUnlock && getUrl(url)}")` }}
                    >
                      {isShowUnlock && <div className={styles.ripple}></div>}
                      {isShowUnlock && <span className={styles.unlockname}>{unlockname}</span>}
                      {/* 信息详情卡片 */}
                      <div 
                        className={`${styles.info_card} ${isEdge(x, StageState.achieveBgX) ? styles.info_card_position_right : ''}`}
                      >
                        {condition && <span className={`${styles.condition} ${isShowUnlock ? styles.condition_bg_active : ''}`}>{condition}</span>}
                        {saveTime && <span className={styles.time}>{`${saveTime}达成`}</span>}
                        <span className={styles.description}>{`${Math.floor(Math.random() * 101)}%`}玩家已达成</span>
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
