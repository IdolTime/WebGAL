import { FC, useEffect } from 'react';
import styles from './options.module.scss';
import { getStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { setOptionData } from '@/store/userDataReducer';
import { RootState } from '@/store/store';
import { setStorage } from '@/Core/controller/storage/storageController';
import { fullScreenOption } from '@/store/userDataInterface';
import { OptionSlider } from '@/UI/Menu/Options/OptionSlider';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setVisibility } from '@/store/GUIReducer';
import { isIOS } from '@/Core/initializeScript';

export const Options: FC = () => {
  useEffect(getStorage, []);
  const { playSeClick, playSeEnter } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();

  return (
    <div className={`${styles.Options_main} ${isIOS ? styles.Options_main_ios : ''}`}>
      <div
        className={styles.Save_back}
        onClick={() => {
          playSeClick();
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        }}
        onMouseEnter={playSeEnter}
      />
      <div className={styles.Options_top} />
      <div className={styles.Options_page_container}>
        {/* 基础设置 */}
        <div className={styles.Options_left}>
          <div className={styles.title_base} />
          <div className={styles.Line}>
            <div className={styles.Label}>画面模式</div>
            <div className={styles.Check_line}>
              <div className={styles.Check_item}>
                <div className={styles.Check_name}>全屏</div>
                <div
                  className={styles.Check_box}
                  onClick={() => {
                    dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.on }));
                    setStorage();
                  }}
                >
                  {!userDataState.optionData.fullScreen ? <div className={styles.Checked_box} /> : null}
                </div>
              </div>
              <div className={styles.Check_item}>
                <div className={styles.Check_name}>窗口</div>
                <div
                  className={styles.Check_box}
                  onClick={() => {
                    dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.off }));
                    setStorage();
                  }}
                >
                  {userDataState.optionData.fullScreen ? <div className={styles.Checked_box} /> : null}
                </div>
              </div>
            </div>
          </div>
          {/* <div className={styles.Line}>
            <div className={styles.Label}>快进模式</div>
            <div className={styles.Check_line}>
              <div className={styles.Check_item}>
                <div className={styles.Check_name} />
                <div className={styles.Check_box} />
              </div>
              <div className={styles.Check_item}>
                <div className={styles.Check_name} />
                <div className={styles.Check_box} />
              </div>
            </div>
          </div> */}
          {/* <TextPreview /> */}
          <div className={styles.Bar_line}>
            <div className={styles.Label_text_speed}>文本播放速度</div>
            <OptionSlider
              initValue={userDataState.optionData.textSpeed}
              uniqueID="文本播放速度"
              onTouchMove={(event) => {
                const newValue = (event.target as HTMLInputElement).value;
                dispatch(setOptionData({ key: 'textSpeed', value: Number(newValue) }));
                setStorage();
              }}
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'textSpeed', value: Number(newValue) }));
                setStorage();
              }}
            />
          </div>
        </div>
        {/* 音效设置 */}
        <div className={styles.Options_right}>
          <div className={styles.title_voice} />
          <div className={styles.Bar_line}>
            <div className={styles.Label}>全局音量</div>
            <OptionSlider
              initValue={userDataState.optionData.volumeMain}
              uniqueID="全局音量"
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'volumeMain', value: Number(newValue) }));
                setStorage();
              }}
              onTouchMove={(event) => {
                const newValue = (event.target as HTMLInputElement).value;
                dispatch(setOptionData({ key: 'volumeMain', value: Number(newValue) }));
                setStorage();
              }}
            />
          </div>
          <div className={styles.Bar_line}>
            <div className={styles.Label}>背景音量</div>
            <OptionSlider
              initValue={userDataState.optionData.bgmVolume}
              uniqueID="背景音量"
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'bgmVolume', value: Number(newValue) }));
                setStorage();
              }}
              onTouchMove={(event) => {
                const newValue = (event.target as HTMLInputElement).value;
                dispatch(setOptionData({ key: 'bgmVolume', value: Number(newValue) }));
                setStorage();
              }}
            />
          </div>
          <div className={styles.Bar_line}>
            <div className={styles.Label}>音效</div>
            <OptionSlider
              initValue={userDataState.optionData.seVolume}
              uniqueID="音效"
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'seVolume', value: Number(newValue) }));
                dispatch(setOptionData({ key: 'uiSeVolume', value: Number(newValue) }));
                setStorage();
              }}
              onTouchMove={(event) => {
                const newValue = (event.target as HTMLInputElement).value;
                dispatch(setOptionData({ key: 'seVolume', value: Number(newValue) }));
                dispatch(setOptionData({ key: 'uiSeVolume', value: Number(newValue) }));
                setStorage();
              }}
            />
          </div>
          <div className={styles.Bar_line}>
            <div className={styles.Label}>角色语音</div>
            <OptionSlider
              initValue={userDataState.optionData.vocalVolume}
              uniqueID="角色语音"
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'vocalVolume', value: Number(newValue) }));
                setStorage();
              }}
              onTouchMove={(event) => {
                const newValue = (event.target as HTMLInputElement).value;
                dispatch(setOptionData({ key: 'vocalVolume', value: Number(newValue) }));
                setStorage();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
