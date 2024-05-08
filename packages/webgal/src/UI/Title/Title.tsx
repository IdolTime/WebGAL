import { FC } from 'react';
import styles from './title.module.scss';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { restorePerform } from '@/Core/controller/storage/jumpFromBacklog';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import useTrans from '@/hooks/useTrans';
// import { resize } from '@/Core/util/resize';
import { hasFastSaveRecord, loadFastSaveGame } from '@/Core/controller/storage/fastSaveLoad';
import useSoundEffect from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import useApplyStyle from '@/hooks/useApplyStyle';
import { fullScreenOption } from '@/store/userDataInterface';
import { keyboard } from '@/hooks/useHotkey';

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
            <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                startGame();
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            >
              <div className={applyStyle('Title_button_text', styles.Title_button_text)}>{t('start.title')}</div>
            </div>
          </div>
          <div
              className={applyStyle('Title_button', styles.Title_button)}
              onClick={() => {
                playSeClick();
                dispatch(setVisibility({ component: 'showExtra', visibility: true }));
              }}
              onMouseEnter={playSeEnter}
            >
              <div className={applyStyle('Title_button_text', styles.Title_button_text)}>{t('extra.title')}</div>
            </div>
        </div>
      )}
    </>
  );
};

export default Title;
