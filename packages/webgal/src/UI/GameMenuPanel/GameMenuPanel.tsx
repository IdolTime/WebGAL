import styles from './gameMenuPanel.module.scss';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import { showGlogalDialog, switchControls } from '@/UI/GlobalDialog/GlobalDialog';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';

export const GameMenuPanel = () => {
  const t = useTrans('gaming.');
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(GUIStore.isShowGameMenu);
  }, [GUIStore.isShowGameMenu]);

  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };

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
   * 保存
   */
  const handleSave = () => {
    playSeClick();
    setMenuPanel(MenuPanelTag.Save);
    setComponentVisibility('isShowGameMenu', false);
    setComponentVisibility('showMenuPanel', true);
  };

  /**
   * 读取
   */
  const handleRead = () => {
    setMenuPanel(MenuPanelTag.Load);
    setComponentVisibility('isShowGameMenu', false);
    setComponentVisibility('showMenuPanel', true);
    playSeClick();
  };

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
      {show && (
        <div className={styles.gameMenuPanelContentWrapper}>
          <div className={styles.mask} />
          <div className={styles.gameMenuPanelContent}>
            <div className={styles.buttonswrapper}>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleBackToGame}>
                {t('buttons.backToGame')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleSave}>
                {t('buttons.preserve')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleRead}>
                {t('buttons.read')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleSetting}>
                {t('buttons.setting')}
              </span>
              <span className={styles.button} onMouseEnter={playSeEnter} onClick={handleBackToTitle}>
                {t('buttons.backToTitle')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
