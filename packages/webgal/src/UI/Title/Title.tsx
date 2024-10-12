import { FC } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { enterStoryLine } from '@/Core/controller/gamePlay/enterSubPage';
import { enterBeautyGuide } from '@/Core/controller/gamePlay/beautyGuide';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { WebGAL } from '@/Core/WebGAL';
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
import { LogPaySuccess } from '@/Core/log';
import { apiStartGameEvent } from '@/services/eventData';
import { getLocalDate } from '@/utils/date';
import { startEvent } from '@/utils/trackEvent';

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

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const minutes2 = 1000 * 60 * 2;

  const applyStyle = useApplyStyle('UI/Title/title.scss');

  const sdk_loadUserInfo = () => {
    const token = sessionStorage.getItem('sdk-token');
    // @ts-ignore
    window.globalThis.getUserInfo(token).then((res: any) => {
      const gameInfo: any = webgalStore.getState().storeData.gameInfo;
      const { acoinBalance } = res.data;
      const { paymentAmount, id } = gameInfo;
      if (acoinBalance < paymentAmount) {
        // 充值
        // @ts-ignore
        window.globalThis.openRechargeDialog(token).then((res: any) => {
          window.location.reload();
        });
      } else {
        // 购买
        // @ts-ignore
        window.globalThis.openBuyGameDialog(token, id).then((res: any) => {
          LogPaySuccess({ paymentAmount });
          setTimeout(() => {
            window.location.reload();
          }, 100);
        });
      }
    });
  };

  const loadUserInfo = (cb: Function) => {
    if (window !== window.top) {
      platform_isCanStart();
      // @ts-ignore
      window.MessageSaveFunc = cb;
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
      loadUserInfo(cb);
    }
  };

  const isNotTryPlay = () => {
    const sceneData = WebGAL.sceneManager.sceneData;
    const res = sceneData.currentScene.sentenceList.filter((item: any) => {
      return item.commandRaw === 'finishTrial' && item.content === 'true';
    });
    return res.length === 0;
  };

  const clickCallbackMap = {
    [TitleSceneButtonKey.Game_start_button]: () => {
      // playSeClick();
      setTimeout(() => {
        startGame();
        dispatch(setshowFavorited(false));
        /** 埋点上报 */
        const gameId = new URLSearchParams(window.location.search).get('gameId') || '';
        const params = {
          thirdUserId: sessionStorage.getItem('sdk-userId') as string,
          productId: String(WebGAL.gameId) || gameId,
          onlineTime: getLocalDate(),
          channel: sessionStorage.getItem('sdk-userId') ? 1 : 0,
        };
        apiStartGameEvent(params);
      }, 16);

      startEvent();
    },
    [TitleSceneButtonKey.Game_achievement_button]: () => {
      enterAchieve();
      // playSeClick();
    },
    [TitleSceneButtonKey.Game_storyline_button]: () => {
      enterStoryLine();
      // playSeClick();
    },
    [TitleSceneButtonKey.Game_extra_button]: () => {
      dispatch(setVisibility({ component: 'showExtra', visibility: true }));
      // playSeClick();
    },
    [TitleSceneButtonKey.Game_collection_button]: () => {
      enterBeautyGuide();
      // playSeClick();
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
      // playSeClick();
      dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
      dispatch(setMenuPanelTag(MenuPanelTag.Load));
    },
    [TitleSceneButtonKey.Game_progression_button]: () => {
      dispatch(setVisibility({ component: 'showProgressAndAchievement', visibility: true }));
    },
    [TitleSceneButtonKey.Game_affinity_button]: () => {
      dispatch(setVisibility({ component: 'showAffinity', visibility: true }));
    },
    [TitleSceneButtonKey.Game_link_button]: () => {
      const linkStr = TitleUIConfigs.buttons[TitleSceneButtonKey.Game_link_button].args?.buttonLink?.link ?? '';
      // playSeClick();
      if (linkStr) {
        if (isSafari) {
          const newWindow = window.open('', '_blank');
          // @ts-ignore
          newWindow.location.href = linkStr;
        } else {
          window.open(linkStr);
        }
      }
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
      <div style={{ opacity: GUIState.showTitle ? 1 : 0, zIndex: GUIState.showTitle ? 1 : -99 }}>
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
                  if (isPreviewMode) {
                    clickCallbackMap[_key]();
                  } else {
                    const gameInfo: any = webgalStore.getState().storeData.gameInfo || {};
                    const { paymentMode } = gameInfo;
                    // 付费 & 不是试玩
                    if (paymentMode === 'paid' && isNotTryPlay()) {
                      loadGameDetail(() => {
                        clickCallbackMap[_key]();
                      });
                    } else {
                      // 免费 || 付费&试玩
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
    </>
  );
};

export default Title;
