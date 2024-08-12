import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import styles from './achievement.module.scss';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { saveActions } from '@/store/savesReducer';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneNameType } from '@/Core/Modules/scene';
import useSoundEffect from '@/hooks/useSoundEffect';
import { px2 } from '@/Core/parser/utils';
import { Button } from '../Components/Base';
import { AchievementSceneUIConfig, Scene } from '@/Core/UIConfigTypes';
import { GameMenuItem } from '@/store/guiInterface';

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

  const [textStyle, setTextStyle] = useState<GameMenuItem | null>(null);
  const [progressBgStyle, setProgressBgStyle] = useState<GameMenuItem | null>(null);
  const [progressStyle, setProgressStyle] = useState<GameMenuItem | null>(null);
  const [notUnlockStyle, setNotUnlockStyle] = useState<GameMenuItem | null>(null);
  /**
   * 
   Achievement_notUnlock
  */

  const [unlockedData, setUnlockedData] = useState({
    unlocked: 0,
    allTotal: 0,
    currentProgress: '0%',
  });
  const achivementUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.achievement],
  ) as AchievementSceneUIConfig;

  useEffect(() => {
    if (GUIState.showAchievement) {
      if (GUIState.achievementUI.Achievement_progress_text) {
        setTextStyle(GUIState.achievementUI.Achievement_progress_text);
      }
      if (GUIState.achievementUI.Achievement_progress_bg) {
        setProgressBgStyle(GUIState.achievementUI.Achievement_progress_bg);
      }
      if (GUIState.achievementUI.Achievement_progress) {
        setProgressStyle(GUIState.achievementUI.Achievement_progress);
      }
      if (GUIState.achievementUI.Achievement_notUnlock) {
        setNotUnlockStyle(GUIState.achievementUI.Achievement_notUnlock);
      }
      // 控制解锁成就显示，当开始游戏后才可解锁
      webgalStore.dispatch(saveActions.setIsShowUnlock(false));
      initAhieve();
    }
  }, [GUIState.showAchievement]);

  async function initAhieve() {
    // 初始化成就场景
    const sceneUrl: string = assetSetter(sceneNameType.Achieve, fileType.scene);
    const rawScene = await sceneFetcher(sceneUrl);
    await WebGAL.sceneManager.setCurrentScene(rawScene, sceneNameType.Achieve, sceneUrl);

    setTimeout(() => {
      initData();
    }, 100);
  }

  async function initData() {
    // await getUnlickAchieveFromStorage()
    const allUnlockAchieveList = webgalStore.getState().saveData.allUnlockAchieveList;

    const unlocked = webgalStore.getState().saveData.unlockAchieveData?.length ?? 0;
    const allTotal = allUnlockAchieveList.length || 0;
    // 当前完成进度
    const currentProgress = ((unlocked / allTotal) * 100).toFixed(2) + '%';
    setUnlockedData({ unlocked, allTotal, currentProgress });
  }

  /**
   * 获得解锁成就图标完整地址
   * @param url {string} 图标名称
   * @returns {string} 完整地址路径
   */
  const getUrl = (url: string) => {
    return assetSetter(url, fileType.ui);
  };

  /**
   * 判断当前图标是否在背景图边缘位置
   * @returns {boolean} true: 在边缘 false: 不在边缘
   */
  const isEdge = (IconX: number, achieveBgX: number) => {
    const infoCardWidth = 500;
    const totalX = IconX + infoCardWidth;
    if (totalX >= achieveBgX) {
      return true;
    }
    return false;
  };

  /**
   * 判断当前图标是否在背景图边缘位置
   */
  const getPositionX = (x: number, achieveBgX: number) => {
    if (x >= achieveBgX) {
      return achieveBgX - 100;
    }
    return x;
  };

  /**
   * 返回
   */
  const handleGoBack = () => {
    playSeClick();
    backToTitle();
    dispatch(setVisibility({ component: 'showAchievement', visibility: false }));
  };

  const renderInfoAchievement = () => {
    const text = !textStyle?.args?.hide ? textStyle?.content ?? '已获得成就' : '';
    const bgUrl = progressBgStyle?.content ? assetSetter(progressBgStyle?.content, fileType.background) : '';
    const pregressUrl = progressStyle?.args.style.image ? assetSetter(progressStyle?.args.style.image , fileType.ui) : '';
    // @ts-ignore
    const pregressActionUrl = progressStyle?.args?.hoverStyle.image ? assetSetter(progressStyle?.args.hoverStyle.image , fileType.ui) : '';
    
    const bgStyle = !progressBgStyle?.args?.hide && bgUrl 
      ? { 
          ...progressBgStyle?.args?.style,
          backgroundImage: `url(${bgUrl})`,
          transform: progressBgStyle?.args.style?.scale && `scale(${progressBgStyle?.args.style?.scale})`,
          width: progressBgStyle?.args.style?.width && `${px2(progressBgStyle?.args.style?.width)}px`,
          height: progressBgStyle?.args.style?.height && `${px2(progressBgStyle?.args.style?.height)}px`,
        } 
      : {};
    
    const textCss = !textStyle?.args?.hide 
    ? {
        ...textStyle?.args?.style,
        color: textStyle?.args?.style.fontColor,
        transform: textStyle?.args.style?.scale ? `scale(${textStyle.args.style.scale})` : '',
      }
    : {}

    const progressBgCss = !progressStyle?.args?.hide
      ? {
        backgroundImage: `url(${pregressUrl})`,
        transform: progressStyle?.args?.style?.scale ? `scale(${progressStyle.args.style.scale})` : undefined,
        width: progressStyle?.args?.style?.width ? `${px2(progressStyle.args.style.width)}px` : undefined,
        height: progressStyle?.args?.style?.height ? `${px2(progressStyle.args.style.height)}px` : undefined,
        top: progressStyle?.args?.style?.y ? `${px2(progressStyle.args.style.y)}px` : undefined,
        left: progressStyle?.args?.style?.x ? `${px2(progressStyle.args.style.x)}px` : undefined,
      } : {}

    const progressBgActionCss = !progressStyle?.args?.hide 
    ? {
      backgroundImage: `url(${pregressActionUrl})`,
      transform: progressStyle?.args?.hoverStyle?.scale ? `scale(${progressStyle.args.hoverStyle?.scale})` : undefined,
      width: progressStyle?.args?.hoverStyle?.width ? `${px2(progressStyle.args.hoverStyle.width)}px` : undefined,
      height: progressStyle?.args?.hoverStyle?.height ? `${px2(progressStyle.args.hoverStyle.height)}px` : undefined
    } : {}

    return (
      <div 
        className={styles.achievement_content}
      >
        <div 
          className={styles.achievement_current}
          style={bgStyle || {}} 
        >
          <span className={styles.text} style={textCss || {}}>
            {text}
          </span>
          <span 
            className={styles.number}
            style={textCss || {}}
          >
            {`${unlockedData.unlocked}/${unlockedData.allTotal}`}
          </span>
          <span 
            className={styles.pregessBar}
            style={progressBgCss || {}}
          >
            <span 
              className={styles.pregressBar_inner} 
              style={{ 
                ...progressBgActionCss,
                width: unlockedData.currentProgress
              }} 
            />
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {GUIState.showAchievement && (
        <div className={styles.achievement}>
          {/* 头部 */}
          <Button
            item={achivementUIConfigs.buttons.Achievement_back_button}
            defaultClass={styles.goback}
            onClick={handleGoBack}
            onMouseEnter={playSeEnter}
          />

          {/* 已获得成就  */}
          {renderInfoAchievement()}

          {/* 内容部分 */}
          <div
            className={styles.achievement_content_bg}
            style={{
              width: px2(StageState.achieveBgX),
              backgroundImage: `url("${StageState.achieveBg}")`,
              backgroundSize:
                StageState.achieveBgX &&
                StageState.achieveBgY &&
                `${px2(StageState.achieveBgX)}px ${px2(StageState.achieveBgY)}px`,
            }}
          >
            {saveData.allUnlockAchieveList?.length > 0 && (
              <div className={styles.achievement_list}>
                {saveData.allUnlockAchieveList?.map(
                  ({ unlockname, x, y, url, isShowUnlock, saveTime, condition }, index) => {

                    const notUnlockCss = !notUnlockStyle?.args.hide
                      ? {
                        width: notUnlockStyle?.args?.style?.width ? `${px2(notUnlockStyle.args.style.width)}px` : undefined,
                        height: notUnlockStyle?.args?.style?.height ? `${px2(notUnlockStyle.args.style.height)}px` : undefined
                      }
                      : {}

                    return (
                      <div
                        key={`unlockAchieveItem-${index}`}
                        className={`${styles.achievement_item} ${
                          isShowUnlock ? styles.achievement_item_bg_active : ''
                        }`}
                        style={{
                          top: `${px2(y)}px`,
                          left: `${getPositionX(px2(x), px2(StageState.achieveBgX))}px`,
                          backgroundImage: `url("${
                            isShowUnlock 
                            ? getUrl(url) 
                            : getUrl(!notUnlockStyle?.args.hide && notUnlockStyle?.args?.style?.image ? notUnlockStyle?.args?.style?.image : '')}")`,
                          ...notUnlockCss
                        }}
                      >
                        {isShowUnlock && <div className={styles.ripple} />}
                        {isShowUnlock && <span className={styles.unlockname}>{unlockname}</span>}
                        {/* 信息详情卡片 */}
                        <div
                          className={`${styles.info_card} ${
                            isEdge(px2(x), px2(StageState.achieveBgX)) ? styles.info_card_position_right : ''
                          }`}
                        >
                          {condition && (
                            <span className={`${styles.condition} ${isShowUnlock ? styles.condition_bg_active : ''}`}>
                              {condition}
                            </span>
                          )}
                          {saveTime && <span className={styles.time}>{`${saveTime}达成`}</span>}
                          <span className={styles.description}>{`${Math.floor(Math.random() * 101)}%`}玩家已达成</span>
                        </div>
                      </div>
                    );
                  },
                ) ?? null}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
