import { FC, useEffect } from 'react';
import styles from './options.module.scss';
import { getStorage, setStorage } from '@/Core/controller/storage/storageController';
import { useValue } from '@/hooks/useValue';
import { System } from '@/UI/Menu/Options/System/System';
import { Display } from '@/UI/Menu/Options/Display/Display';
import { Sound } from '@/UI/Menu/Options/Sound/Sound';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibility } from '@/store/GUIReducer';
import { fullScreenOption } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { RootState } from '@/store/store';
import { OptionSlider } from './OptionSlider';

enum optionPage {
  'System',
  'Display',
  'Sound',
}

export const Options: FC = () => {
  const { playSeEnter, playSeSwitch, playSeClick } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const currentOptionPage = useValue(optionPage.System);
  useEffect(getStorage, []);
  const dispatch = useDispatch();

  const t = useTrans('menu.options.');

  return (
    <div className={styles.Options_main}>
      <div
        className={styles.Options_back}
        onMouseEnter={playSeEnter}
        onClick={() => {
          playSeClick();
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        }}
      />
      <div
        className={`${styles.Options_checkbox} ${
          userDataState.optionData.fullScreen ? '' : styles.Options_checkbox_active
        }`}
        onMouseEnter={playSeEnter}
        onClick={() => {
          playSeClick();
          dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.on }));
          setStorage();
        }}
      />
      <div
        className={`${styles.Options_checkbox} ${styles.Options_checkbox_window} ${
          userDataState.optionData.fullScreen ? styles.Options_checkbox_active : ''
        }`}
        onMouseEnter={playSeEnter}
        onClick={() => {
          playSeClick();
          console.log(4444);
          dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.off }));
          setStorage();
        }}
      />
      <div className={styles.Options_sound_slider}>
        <OptionSlider
          initValue={userDataState.optionData.seVolume}
          uniqueID="音效"
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'seVolume', value: Number(newValue) }));
            dispatch(setOptionData({ key: 'uiSeVolume', value: Number(newValue) }));
            setStorage();
          }}
        />
      </div>
      <div className={styles.Options_main_slider}>
        <OptionSlider
          initValue={userDataState.optionData.volumeMain}
          uniqueID="全局音量"
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'volumeMain', value: Number(newValue) }));
            setStorage();
          }}
        />
      </div>
      {/* <div className={styles.Options_page_container}>
        <div className={styles.Options_button_list}>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.System);
              playSeSwitch();
            }}
            className={getClassName(optionPage.System)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.system.title')}
          </div>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.Display);
              playSeSwitch();
            }}
            className={getClassName(optionPage.Display)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.display.title')}
          </div>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.Sound);
              playSeSwitch();
            }}
            className={getClassName(optionPage.Sound)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.sound.title')}
          </div>
        </div>
        <div className={styles.Options_main_content}>
          {currentOptionPage.value === optionPage.Display && <Display />}
          {currentOptionPage.value === optionPage.System && <System />}
          {currentOptionPage.value === optionPage.Sound && <Sound />}
        </div>
      </div> */}
    </div>
  );
};
