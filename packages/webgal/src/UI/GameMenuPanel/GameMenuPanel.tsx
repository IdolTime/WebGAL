import styles from './gameMenuPanel.module.scss';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';
import { stopEvent } from '@/utils/trackEvent';

export const GameMenuPanel = () => {
  const t = useTrans('gaming.');
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const [show, setShow] = useState(false);
  const clickedTimeRef = useRef<number>(0);

  useEffect(() => {
    setShow(GUIStore.isShowGameMenu);
  }, [GUIStore.isShowGameMenu]);

  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };

  useEffect(() => {
    const handleKeyPress = (event: { keyCode: number }) => {
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
        setComponentVisibility('isInGaming', false);
        backToTitle();
        stopEvent();
      },
    });
  };

  return (
    <>
      <div className={styles.gameMenuPanel}>
        <div
          className={`${styles.menuButton} interactive`}
          onMouseEnter={playSeEnter}
          onMouseDown={(e) => {
            const node = e.currentTarget as HTMLDivElement;
            node.className = `${styles.menuButton} interactive btn-clicked`;
            clickedTimeRef.current = Date.now();
          }}
          onMouseUp={(e) => {
            const duration = Date.now() - clickedTimeRef.current;
            let node = e.currentTarget;

            setTimeout(
              () => {
                node.className = `${styles.menuButton} interactive`;
                // @ts-ignore
                node = null;

                setTimeout(handleShowGameMenuPanel, 320);
              },
              duration - 350 > 0 ? 0 : 350 - duration,
            );
          }}
        />
      </div>
      {show && (
        <div className={styles.gameMenuPanelContentWrapper}>
          <div className={styles.mask} />
          <div className={styles.gameMenuPanelContent}>
            <div className={styles.buttonswrapper}>
              <span
                className={`${styles.button} interactive`}
                onMouseEnter={playSeEnter}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = `${styles.button} interactive btn-clicked`;
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = `${styles.button} interactive`;
                      // @ts-ignore
                      node = null;

                      setTimeout(handleBackToGame, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
              >
                {t('buttons.backToGame')}
              </span>
              <span
                className={`${styles.button} interactive`}
                onMouseEnter={playSeEnter}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = `${styles.button} btn-clicked`;
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = `${styles.button} interactive`;
                      // @ts-ignore
                      node = null;

                      setTimeout(handleSave, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
              >
                {t('buttons.preserve')}
              </span>
              <span
                className={`${styles.button} interactive`}
                onMouseEnter={playSeEnter}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = `${styles.button} btn-clicked`;
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = `${styles.button} interactive`;
                      // @ts-ignore
                      node = null;

                      setTimeout(handleRead, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
              >
                {t('buttons.read')}
              </span>
              <span
                className={`${styles.button} interactive`}
                onMouseEnter={playSeEnter}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = `${styles.button} btn-clicked`;
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = `${styles.button} interactive`;
                      // @ts-ignore
                      node = null;

                      setTimeout(handleSetting, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
              >
                {t('buttons.setting')}
              </span>
              <span
                className={`${styles.button} interactive`}
                onMouseEnter={playSeEnter}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = `${styles.button} btn-clicked`;
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = `${styles.button} interactive`;
                      // @ts-ignore
                      node = null;

                      setTimeout(handleBackToTitle, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
              >
                {t('buttons.backToTitle')}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
