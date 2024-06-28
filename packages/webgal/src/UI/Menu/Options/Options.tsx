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

export const Options: FC = () => {
  useEffect(getStorage, []);
  const { playSeClick, playSeEnter } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();

  return (
    <div className={styles.Options_main}>
      <div className={styles.Options_top}>
        <div
          className={styles.Save_back}
          onClick={() => {
            playSeClick();
            dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
          }}
          onMouseEnter={playSeEnter}
        />
      </div>
      <div className={styles.Options_page_container}>
        {/* 基础设置 */}
        <div className={styles.Options_left}>
          <div className={styles.title_base} />
          <div className={`${styles.Label_row} ${styles.mt48}`}>
            <span className={styles.Label_row_text}>画面模式</span>
            <span className={styles.Label_row_decoration} />
          </div>
          <div className={styles.Check_row}>
            <div className={styles.Check_row_option}>
              <span className={styles.Check_row_prefix}>全屏</span>
              <div
                className={styles.Check_row_box}
                onClick={() => {
                  dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.on }));
                  setStorage();
                }}
              >
                {!userDataState.optionData.fullScreen ? <div className={styles.Check_row_box_checked} /> : null}
              </div>
            </div>
            <div className={styles.Check_row_option}>
              <span className={styles.Check_row_prefix}>窗口化</span>
              <div
                className={styles.Check_row_box}
                onClick={() => {
                  dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.off }));
                  setStorage();
                }}
              >
                {userDataState.optionData.fullScreen ? <div className={styles.Check_row_box_checked} /> : null}
              </div>
            </div>
          </div>
          <div className={`${styles.Label_row} ${styles.mt48}`}>
            <span className={styles.Label_row_text}>文本播放速度</span>
            <span className={styles.Label_row_decoration} />
          </div>
          <OptionSlider
            initValue={userDataState.optionData.textSpeed}
            uniqueID="文本播放速度"
            onChange={(event) => {
              const newValue = event.target.value;
              dispatch(setOptionData({ key: 'textSpeed', value: Number(newValue) }));
              setStorage();
            }}
          />
        </div>
        {/* 音效设置 */}
        <div className={styles.Options_right}>
          <div className={styles.title_voice} />
          <div className={`${styles.Label_row} ${styles.mt32} ${styles.Label_row_right}`}>
            <span className={styles.Label_row_text}>全局音量</span>
            <span className={styles.Label_row_decoration} />
          </div>
          <div className={styles.Slider_wrapper}>
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
          <div className={`${styles.Label_row} ${styles.mt32} ${styles.Label_row_right}`}>
            <span className={styles.Label_row_text}>背景音量</span>
            <span className={styles.Label_row_decoration} />
          </div>
          <div className={styles.Slider_wrapper}>
            <OptionSlider
              initValue={userDataState.optionData.bgmVolume}
              uniqueID="背景音量"
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'bgmVolume', value: Number(newValue) }));
                setStorage();
              }}
            />
          </div>
          <div className={`${styles.Label_row} ${styles.mt32} ${styles.Label_row_right}`}>
            <span className={styles.Label_row_text}>音效</span>
            <span className={styles.Label_row_decoration} />
          </div>
          <div className={styles.Slider_wrapper}>
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
          <div className={`${styles.Label_row} ${styles.mt22} ${styles.Label_row_right}`}>
            <span className={styles.Label_row_text}>角色语音</span>
            <span className={styles.Label_row_decoration} />
          </div>
          <div className={styles.Slider_wrapper}>
            <OptionSlider
              initValue={userDataState.optionData.vocalVolume}
              uniqueID="角色语音"
              onChange={(event) => {
                const newValue = event.target.value;
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
