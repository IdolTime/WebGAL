import { useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { componentsVisibility, MenuPanelTag, EecMenuKey } from '@/store/guiInterface';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { RootState, webgalStore } from '@/store/store';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import useApplyStyle from '@/hooks/useApplyStyle';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { px2 } from '@/Core/parser/utils';
import { saveActions } from '@/store/savesReducer';

import styles from './gameMenuPanel.module.scss';

export const GameMenuPanel = () => {
  const t = useTrans('gaming.');
  const dispatch = useDispatch();
  const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);

  const applyStyle = useApplyStyle('UI/GameMenuPanel/gameMenuPanel.scss');
  
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };

  useEffect(() => {
    const handleKeyPress = (event: { keyCode: number; }) => {
      if (event.keyCode === 27 && webgalStore.getState().GUI.isInGaming) {
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

  const clickCallbackMap = {
    [EecMenuKey.Esc_continueGame_button]: () => {
      playSeClick();
      setComponentVisibility('isShowGameMenu', false);
    },
    [EecMenuKey.Esc_backToLevel_button]: () => {
      playSeClick();
      setComponentVisibility('isShowGameMenu', false);
      setComponentVisibility('isInGaming', false);
      dispatch(saveActions.setSaveStatus({ key: 'prevPlayVideo', value: '' }));
      backToTitle();
    },

    [EecMenuKey.Esc_setting_button]: () => {
      playSeClick();
      setMenuPanel(MenuPanelTag.Option);
      setComponentVisibility('isShowGameMenu', false);
      setComponentVisibility('showMenuPanel', true);
    },
    [EecMenuKey.Esc_exitGame_button]: () => {
      playSeClick();
      playSeDialogOpen();
      showGlogalDialog({
        title: t('buttons.quitTips'),
        leftText: t('$common.cancel'),
        rightText: t('$common.confirm'),
        leftFunc: () => {},
        rightFunc: () => {
          setComponentVisibility('isShowGameMenu', false);
          setComponentVisibility('isInGaming', false);
          window.location.href = '/';
          // backToTitle();
        },
      });
    }
  }


  const renderButton = (key: EecMenuKey) => {
    const menu = GUIStore.escMenus[key];

    if (!menu || menu.args.hide) return null;

    const styleObj: CSSProperties = {};
    const styleText: CSSProperties = {};
    // let className = styles.button;
    const id = `escMenu-${key}`;

    if (menu.args.style) {
      const style = menu.args.style;

      if (style.btnPosition !== 'custom') {
        styleObj['alignSelf'] = style.btnPosition
      }

      if (typeof style.align === 'string') {
        //@ts-ignore
        styleObj['textAlign'] = style.align
      }

      if (typeof style.fontFamily === 'string' && style.fontFamily) {
        styleObj['fontFamily'] = style.fontFamily
      }

      if (typeof style.x === 'number' && style.btnPosition === 'custom') {
        styleObj.position = 'fixed', // 'absolute';
        styleObj['left'] = px2(style.x) + 'px';
        // styleObj['transform'] = 'translateX(-50%)';
      }
      if (typeof style.y === 'number' && style.btnPosition == 'custom') {
        styleObj.position = 'fixed'; // 'absolute';
        styleObj['top'] = px2(style.y) + 'px';
        // if (styleObj['transform']) {
          // styleObj['transform'] += ' translateY(-50%)';
        // } else {
          // styleObj['transform'] = 'translateY(-50%)';
        // }
      }
      if (typeof style.scale === 'number') {
        if (styleObj['transform']) {
          styleObj['transform'] += `scale(${style.scale})`;
        } else {
          styleObj['transform'] = `scale(${style.scale})`;
        }
      }
      if (typeof style.fontSize === 'number' && style.fontSize) {
        styleText['fontSize'] = px2(style.fontSize) + 'px';
      }
      if (typeof style.fontColor === 'string' && style.fontColor[0] === '#') {
        styleObj['color'] = style.fontColor;
      }
    }

    if (menu.args.style?.btnImage) {
      let ele = document.getElementById(id);
      // className = styles.button_custom;

      if (!ele) {
        const imgUrl = assetSetter(menu.args.style.btnImage, fileType.ui);
        const img = new Image();
        img.src = imgUrl; // 将图片的URL赋值给Image对象的src属性

        img.onload = function () {
          let ele = document.getElementById(id);
          // img.style.width = img.naturalWidth + 'px';
          // img.style.height = img.naturalHeight + 'px';
          img.alt = menu.content;

          if (ele) {
            // ele.style.width = img.naturalWidth + 'px';
            // ele.style.height = img.naturalHeight + 'px';
            setTimeout(() => {
              ele?.prepend(img);
              ele = null;
            }, 32);
          }
        };
      }
    }

    // const nameMap = {
    //   Esc_continueGame_button: '继续游戏',
    //   Esc_backToLevel_button: '返回关卡',
    //   Esc_setting_button: '设置', 
    //   Esc_exitGame_button: '退出游戏',
    // }
    const btnTextElement = document.getElementById(`${id}-text`)
    if (btnTextElement && menu?.content) {
      btnTextElement.innerText = menu.content?.replace(/\\n/g, "\n") ?? '';
    }
    
    return (
      <span 
        id={id}
        key={key}
        className={`
          ${menu.args.style?.btnImage ? styles.button_custom : styles.button} 
          interactive`
        }
        onMouseEnter={playSeEnter}
        onClick={clickCallbackMap[key]}
        style={styleObj}
      >
        <span className={styles.button_text} style={styleText} id={`${id}-text`}>
          {/* {nameMap[key]} */}
        </span>
      </span>
    )
  }

  return (
    <>
      <div className={styles.gameMenuPanel}>
        <div 
          className={styles.menuButton} 
          onClick={handleShowGameMenuPanel} 
          onMouseEnter={playSeEnter} 
        />
      </div>
      {GUIStore.isShowGameMenu && (
        <div className={styles.gameMenuPanelContentWrapper}>
          <div className={styles.mask} />
          <div className={styles.gameMenuPanelContent}>
            <div className={styles.content}>
              <div className={styles.buttons_wrapper}>
                {/* 继续 */}
                {renderButton(EecMenuKey.Esc_continueGame_button)}
                {/* 返回关卡 */}
                {renderButton(EecMenuKey.Esc_backToLevel_button)}
                {/* 设置 */}
                {renderButton(EecMenuKey.Esc_setting_button)}
                {/* 返回主界面 */}
                {renderButton(EecMenuKey.Esc_exitGame_button)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
