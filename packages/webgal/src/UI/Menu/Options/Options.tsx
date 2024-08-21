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
import { useUILight } from '@/hooks/useUILight';
import { OptionVideoSize } from './OptionVideoSize';
import { BgImage, Button, OptionSliderCustome } from '@/UI/Components/Base';
import { OptionSceneButtonKey, OptionSceneOtherKey, OptionSceneUIConfig, Scene } from '@/Core/UIConfigTypes';

enum optionPage {
  'System',
  'Display',
  'Sound',
}

const configLight = {
  min: 50,
  max: 100,
};

export const Options: FC = () => {
  const { playSeEnter, playSeSwitch, playSeClick } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const currentOptionPage = useValue(optionPage.System);
  useEffect(getStorage, []);
  const dispatch = useDispatch();
  const optionUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.option],
  ) as OptionSceneUIConfig;

  const t = useTrans('menu.options.');

  return (
    <div className={styles.Options_main}>
      <BgImage item={optionUIConfigs.other[OptionSceneOtherKey.Option_bg]} defaultClass={styles.Options_bg} />
      <Button
        item={optionUIConfigs.buttons[OptionSceneButtonKey.Option_back_button]}
        defaultClass={styles.Options_back}
        onMouseEnter={playSeEnter}
        onClick={() => {
          playSeClick();
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        }}
      />
      <Button
        checked={userDataState.optionData.fullScreen === fullScreenOption.on}
        item={optionUIConfigs.other[OptionSceneOtherKey.Option_fullscreen_checkbox]}
        defaultClass={`${styles.Options_checkbox} ${
          userDataState.optionData.fullScreen ? '' : styles.Options_checkbox_active
        }`}
        onMouseEnter={playSeEnter}
        type="checkbox"
        onChecked={() => {
          playSeClick();
          dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.on }));
          setStorage();
        }}
      />
      <Button
        checked={userDataState.optionData.fullScreen === fullScreenOption.off}
        item={optionUIConfigs.other[OptionSceneOtherKey.Option_window_checkbox]}
        defaultClass={`${styles.Options_checkbox} ${styles.Options_checkbox_window} ${
          userDataState.optionData.fullScreen ? styles.Options_checkbox_active : ''
        }`}
        onMouseEnter={playSeEnter}
        type="checkbox"
        onChecked={() => {
          playSeClick();
          dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.off }));
          setStorage();
        }}
      />

      {/* 视频尺寸 */}
      <OptionVideoSize />

      {/* 亮度 */}
        <OptionSliderCustome
          item={optionUIConfigs.other[OptionSceneOtherKey.Options_light_slider]}
          defaultClass={styles.Options_light_slider}
          initValue={userDataState.optionData.uiLight}
          // uniqueID="亮度"
          uniqueID="light"
          min={configLight.min}
          max={configLight.max}
          onChange={(event) => {
            let newValue = Number(event.target.value);
            if (newValue < configLight.min) {
              newValue = configLight.min;
            }
            useUILight(newValue);
            dispatch(setOptionData({ key: 'uiLight', value: newValue }));
            setStorage();
          }}
        />

      <OptionSliderCustome
        item={optionUIConfigs.other[OptionSceneOtherKey.Option_effect_volume_slider]}
        defaultClass={styles.Options_sound_slider}
        initValue={userDataState.optionData.seVolume}
        // uniqueID="音效"
        uniqueID="seVolume"
        onChange={(event) => {
          const newValue = event.target.value;
          dispatch(setOptionData({ key: 'seVolume', value: Number(newValue) }));
          dispatch(setOptionData({ key: 'uiSeVolume', value: Number(newValue) }));
          setStorage();
        }}
      />
      <OptionSliderCustome
        initValue={userDataState.optionData.volumeMain}
        item={optionUIConfigs.other[OptionSceneOtherKey.Option_global_volume_slider]}
        defaultClass={styles.Options_main_slider}
        // uniqueID="全局音量"
        uniqueID="volumeMain"
        onChange={(event) => {
          const newValue = event.target.value;
          dispatch(setOptionData({ key: 'volumeMain', value: Number(newValue) }));
          setStorage();
        }}
      />
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
