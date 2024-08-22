import { FC } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { enterStoryLine } from '@/Core/controller/gamePlay/enterSubPage';
import { enterBeautyGuide } from '@/Core/controller/gamePlay/beautyGuide';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import { setshowFavorited } from '@/store/GUIReducer';
// import { resize } from '@/Core/util/resize';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { fullScreenOption } from '@/store/userDataInterface';
import { keyboard } from '@/hooks/useHotkey';
import { enterAchieve } from '@/Core/controller/achieve/achieve';
import { BgImage, Button } from '../Components/Base';
import { Scene, TitleSceneButtonKey, TitleSceneOtherKey, TitleSceneUIConfig } from '@/Core/UIConfigTypes';

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
  const clickCallbackMap = {
    [TitleSceneButtonKey.Game_start_button]: () => {
      startGame();
      playSeClick();
      dispatch(setshowFavorited(false));
    },
    [TitleSceneButtonKey.Game_achievement_button]: () => {
      enterAchieve();
      playSeClick();
    },
    [TitleSceneButtonKey.Game_storyline_button]: () => {
      enterStoryLine();
      playSeClick();
    },
    [TitleSceneButtonKey.Game_extra_button]: () => {
      dispatch(setVisibility({ component: 'showExtra', visibility: true }));
      playSeClick();
    },
    [TitleSceneButtonKey.Game_collection_button]: () => {
      enterBeautyGuide();
      playSeClick();
    },
    [TitleSceneButtonKey.Game_continue_button]: () => {
      playSeClick();
      dispatch(setVisibility({ component: 'showTitle', visibility: false }));
      continueGame();
    },
    [TitleSceneButtonKey.Game_option_button]: () => {
      playSeClick();
      dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
      dispatch(setMenuPanelTag(MenuPanelTag.Option));
    },
    [TitleSceneButtonKey.Game_load_button]: () => {
      playSeClick();
      dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
      dispatch(setMenuPanelTag(MenuPanelTag.Load));
    },
    [TitleSceneButtonKey.Game_progression_button]: () => {
      playSeClick();
      dispatch(setVisibility({ component: 'showProgressAndAchievement', visibility: true }));
    },
    [TitleSceneButtonKey.Game_affinity_button]: () => {
      playSeClick();
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
                  defaultClass={styles.Title_button}
                  defaultTextClass={styles.Title_button_text}
                  onClick={clickCallbackMap[_key]}
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
