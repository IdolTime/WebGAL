import styles from './gameMenuPanel.module.scss';
import useSoundEffect from '@/hooks/useSoundEffect';
import React, { useState, useEffect, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import { showGlogalDialog, switchControls } from '@/UI/GlobalDialog/GlobalDialog';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';

export const GameMenuPanel = () => {
  const t = useTrans('gaming.');
  const dispatch = useDispatch();
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);

  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };

  useEffect(() => {
    const handleKeyPress = (event: { keyCode: number; }) => {
        if (event.keyCode === 27) {
            // 在这里处理 ESC 按键按下的事件
            playSeClick();
            setComponentVisibility('isShowGameMenu', !GUIStore.isShowGameMenu);
            
        }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
        document.removeEventListener('keydown', handleKeyPress);
    };
}, []);


  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  /**
   * 显示游戏菜单面板
   */
  const handleShowGameMenuPanel = () => {
    playSeClick();
    setComponentVisibility('isShowGameMenu', true);
  };

  /**
   * 返回游戏
   */
  const handleBackToGame = () => {
    playSeClick();
    setComponentVisibility('isShowGameMenu', false);
  };

  /**
   * 返回关卡
   */
  const handleBackToLevel = () => {
    playSeClick();
    setComponentVisibility('isShowGameMenu', false);
  };

  /**
   * 读取
   */
//   const handleRead = () => {
//     setMenuPanel(MenuPanelTag.Load);
//     setComponentVisibility('isShowGameMenu', false);
//     setComponentVisibility('showMenuPanel', true);
//     playSeClick();
//   };

  /**
   * 设置
   */
  const handleSetting = () => {
    setMenuPanel(MenuPanelTag.Option);
    setComponentVisibility('isShowGameMenu', false);
    setComponentVisibility('showMenuPanel', true);
    playSeClick();
  };

  /**
   * 返回标题
   */
  const handleBackToTitle = () => {
    playSeDialogOpen();
    showGlogalDialog({
      title: t('buttons.quitTips'),
      leftText: t('$common.cancel'),
      rightText: t('$common.confirm'),
      leftFunc: () => {},
      rightFunc: () => {
        setComponentVisibility('isShowGameMenu', false);
        backToTitle();
      },
    });
  };

  return (
    <>
      <div className={styles.gameMenuPanel}>
        <div className={styles.menuButton} onClick={handleShowGameMenuPanel} onMouseEnter={playSeEnter} />
      </div>
      {GUIStore.isShowGameMenu && (
        <div className={styles.gameMenuPanelContentWrapper}>
          <div className={styles.mask} />
          <div className={styles.gameMenuPanelContent}>
            <div className={styles.buttonswrapper}>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleBackToGame}>
                 {/* 继续 */}
                {t('buttons.continue')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleBackToLevel}>
                {/* 返回关卡 */}
                {t('buttons.backToLevel')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleSetting}>
                {/* 设置 */}
                {t('buttons.setting')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleBackToTitle}>
                {/* 返回主界面 */}
                {t('buttons.backToHome')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
