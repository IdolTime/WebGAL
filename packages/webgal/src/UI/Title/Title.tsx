import { CSSProperties, FC, useMemo } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { enterStoryLine } from '@/Core/controller/gamePlay/storyLine';
import { enterBeautyGuide } from '@/Core/controller/gamePlay/beautyGuide';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setMenuPanelTag, setVisibility, setShowStoryLine } from '@/store/GUIReducer';
import { MenuPanelTag, GameMenuEnum, GameMenuKey } from '@/store/guiInterface';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { restorePerform } from '@/Core/controller/storage/jumpFromBacklog';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import useTrans from '@/hooks/useTrans';
import { setshowFavorited } from '@/store/GUIReducer';
// import { resize } from '@/Core/util/resize';
import { hasFastSaveRecord, loadFastSaveGame } from '@/Core/controller/storage/fastSaveLoad';
import useSoundEffect from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import useApplyStyle from '@/hooks/useApplyStyle';
import { fullScreenOption } from '@/store/userDataInterface';
import { keyboard } from '@/hooks/useHotkey';
import { enterAchieve } from '@/Core/controller/achieve/achieve';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const background = GUIState.titleBg;
  const showBackground = background === '' ? 'rgba(0,0,0,1)' : `url("${background}")`;
  const t = useTrans('title.');
  const { playSeEnter, playSeClick } = useSoundEffect();

  const applyStyle = useApplyStyle('UI/Title/title.scss');
  const clickCallbackMap = {
    [GameMenuKey.Game_start_button]: () => {
      startGame();
      playSeClick();
      dispatch(setshowFavorited(false));
    },
    [GameMenuKey.Game_achievement_button]: () => {
      enterAchieve();
      playSeClick();
    },
    [GameMenuKey.Game_storyline_button]: () => {
      enterStoryLine();
      playSeClick();
    },
    [GameMenuKey.Game_extra_button]: () => {
      enterBeautyGuide();
      playSeClick();
    },
  };

  /**
   * 展示成就页面
   */
  const showAchievement = () => {
    dispatch(setVisibility({ component: 'showAchievement', visibility: true }));
  };

  const renderButton = (key: GameMenuKey) => {
    const menu = GUIState.gameMenus[key];

    if (!menu || menu.args.hide) return null;
    const styleObj: CSSProperties = {};
    let className = styles.Title_button;
    const id = `title-${key}`;

    if (menu.args.style) {
      const style = menu.args.style;
      if (typeof style.x === 'number') {
        styleObj.position = 'absolute';
        styleObj['left'] = style.x + 'px';
        styleObj['transform'] = 'translateX(-50%)';
      }
      if (typeof style.y === 'number') {
        styleObj.position = 'absolute';
        styleObj['top'] = style.y + 'px';
        if (styleObj['transform']) {
          styleObj['transform'] += ' translateY(-50%)';
        } else {
          styleObj['transform'] = 'translateY(-50%)';
        }
      }
      if (typeof style.scale === 'number') {
        if (styleObj['transform']) {
          styleObj['transform'] += ' scale(' + style.scale + ')';
        } else {
          styleObj['transform'] = 'scale(' + style.scale + ')';
        }
      }
      if (typeof style.fontSize === 'number') {
        styleObj['fontSize'] = style.fontSize + 'px';
      }
      if (typeof style.fontColor === 'string' && style.fontColor[0] === '#') {
        styleObj['color'] = style.fontColor;
      }
    }

    if (menu.args.style?.image) {
      let ele = document.getElementById(id);
      className = styles.Title_button_custom;

      if (!ele) {
        const imgUrl = assetSetter(menu.args.style.image, fileType.ui);
        const img = new Image();
        img.src = imgUrl; // 将图片的URL赋值给Image对象的src属性

        img.onload = function () {
          let ele = document.getElementById(id);
          img.style.width = img.naturalWidth + 'px';
          img.style.height = img.naturalHeight + 'px';
          img.alt = menu.content;

          if (ele) {
            ele.style.width = img.naturalWidth + 'px';
            ele.style.height = img.naturalHeight + 'px';
            setTimeout(() => {
              ele?.prepend(img);
              ele = null;
            }, 32);
          }
        };
      }
    }

    return (
      <div
        id={id}
        key={key}
        className={applyStyle('Title_button', className)}
        onClick={clickCallbackMap[key]}
        onMouseEnter={playSeEnter}
        style={styleObj}
      >
        <span className={styles.Title_button_text}>{menu.content}</span>
      </div>
    );
  };

  return (
    <>
      {GUIState.showTitle && <div className={applyStyle('Title_backup_background', styles.Title_backup_background)} />}
      <div
        id="enter_game_target"
        onClick={() => {
          playBgm(GUIState.titleBgm);
          dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
          if (fullScreen === fullScreenOption.on) {
            document.documentElement.requestFullscreen();
            if (keyboard) keyboard.lock(['Escape', 'F11']);
          }
        }}
        onMouseEnter={playSeEnter}
      />
      {GUIState.showTitle && (
        <div
          className={applyStyle('Title_main', styles.Title_main)}
          style={{
            backgroundImage: showBackground,
            backgroundSize: 'cover',
          }}
        >
          <div className={applyStyle('Title_buttonList', styles.Title_buttonList)}>
            {/* 开始游戏 */}
            {renderButton(GameMenuKey.Game_start_button)}

            {/* 成就 */}
            {renderButton(GameMenuKey.Game_achievement_button)}

            {/* 故事线 */}
            {renderButton(GameMenuKey.Game_storyline_button)}

            {/* 图鉴 */}
            {renderButton(GameMenuKey.Game_extra_button)}
          </div>
        </div>
      )}
    </>
  );
};

export default Title;
