import { FC } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { enterStoryLine } from '@/Core/controller/gamePlay/enterSubPage';
import { enterBeautyGuide } from '@/Core/controller/gamePlay/beautyGuide';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import { setshowFavorited } from '@/store/GUIReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { fullScreenOption } from '@/store/userDataInterface';
import { keyboard } from '@/hooks/useHotkey';
import { enterAchieve } from '@/Core/controller/achieve/achieve';
import { BgImage, Button } from '../Components/Base';
import { Scene, TitleSceneButtonKey, TitleSceneOtherKey, TitleSceneUIConfig } from '@/Core/UIConfigTypes';
import { platform_isCanStart } from '@/Core/platformMessage';

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const { playSeEnter, playSeClick } = useSoundEffect();
  const TitleUIConfigs = GUIState.gameUIConfigs[Scene.title] as TitleSceneUIConfig;

  const applyStyle = useApplyStyle('UI/Title/title.scss');

  const sdk_loadUserInfo = () => {
    const token = localStorage.getItem('sdk-token');
    // @ts-ignore
    window.globalThis.getUserInfo(token).then((res: any) => {
      console.log('getUserInfo success : ', res);
      const gameInfo: any = webgalStore.getState().storeData.gameInfo;
      const { acoinBalance } = res.data;
      const { paymentAmount, id } = gameInfo;
      if (acoinBalance < paymentAmount) {
        // 充值
        // @ts-ignore
        window.globalThis.openRechargeDialog(token).then((res: any) => {
          console.log('openRechargeDialog success : ', res);
        });
      } else {
        // 购买
        // @ts-ignore
        window.globalThis.openBuyGameDialog(token, id).then((res: any) => {
          console.log('openBuyGameDialog success : ', res);
          // todo 买游戏上报
        });
      }
    });
  };

  const loadUserInfo = () => {
    if (window !== window.top) {
      platform_isCanStart();
    } else {
      sdk_loadUserInfo();
    }
  };

  const loadGameDetail = (cb: Function) => {
    const gameInfo: any = webgalStore.getState().storeData.gameInfo;
    // 买过了
    if (gameInfo.isBuy) {
      cb();
    } else {
      loadUserInfo();
    }
  };

  const clickCallbackMap = {
    [TitleSceneButtonKey.Game_start_button]: () => {
      startGame();
      dispatch(setshowFavorited(false));
    },
    [TitleSceneButtonKey.Game_achievement_button]: () => {
      enterAchieve();
    },
    [TitleSceneButtonKey.Game_storyline_button]: () => {
      enterStoryLine();
    },
    [TitleSceneButtonKey.Game_extra_button]: () => {
      dispatch(setVisibility({ component: 'showExtra', visibility: true }));
    },
    [TitleSceneButtonKey.Game_collection_button]: () => {
      enterBeautyGuide();
    },
    [TitleSceneButtonKey.Game_continue_button]: () => {
      dispatch(setVisibility({ component: 'showTitle', visibility: false }));
      dispatch(setVisibility({ component: 'isInGaming', visibility: true }));
      continueGame();
    },
    [TitleSceneButtonKey.Game_option_button]: () => {
      dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
      dispatch(setMenuPanelTag(MenuPanelTag.Option));
    },
    [TitleSceneButtonKey.Game_load_button]: () => {
      dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
      dispatch(setMenuPanelTag(MenuPanelTag.Load));
    },
    [TitleSceneButtonKey.Game_progression_button]: () => {
      dispatch(setVisibility({ component: 'showProgressAndAchievement', visibility: true }));
    },
    [TitleSceneButtonKey.Game_affinity_button]: () => {
      dispatch(setVisibility({ component: 'showAffinity', visibility: true }));
    },
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
        <div>
          <BgImage
            defaultClass={applyStyle('Title_main', styles.Title_main)}
            item={TitleUIConfigs.other[TitleSceneOtherKey.Title_img]}
          />
          <div className={applyStyle('Title_buttonList', styles.Title_buttonList)}>
            {Object.keys(TitleUIConfigs.buttons).map((key) => {
              let _key = key as TitleSceneButtonKey;
              let buttonConfigItem = TitleUIConfigs.buttons[_key];
              return (
                <Button
                  key={_key}
                  item={buttonConfigItem}
                  defaultClass={`${styles.Title_button} interactive`}
                  defaultTextClass={styles.Title_button_text}
                  onClick={() => {
                    const isPreviewMode = webgalStore.getState().storeData.isEditorPreviewMode;
                    // @ts-ignore
                    const is_terre = window?.top[0]?.origin.indexOf('localhost') > -1;
                    if (isPreviewMode || is_terre) {
                      clickCallbackMap[_key]();
                    } else {
                      const gameInfo: any = webgalStore.getState().storeData.gameInfo || {};
                      const { paymentMode } = gameInfo;
                      // 付费
                      if (paymentMode === 'paid') {
                        loadGameDetail(() => {
                          clickCallbackMap[_key]();
                        });
                      } else {
                        // 免费
                        clickCallbackMap[_key]();
                      }
                    }
                  }}
                  onMouseEnter={playSeEnter}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Title;
