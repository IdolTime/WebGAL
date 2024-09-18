import { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { videoSizeOption, textSize } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { setStage } from '@/store/stageReducer';
import { RootState } from '@/store/store';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { OptionSceneOtherKey, OptionSceneUIConfig, Scene } from '@/Core/UIConfigTypes';
import { setStorage } from '@/Core/controller/storage/storageController';
import { updateScreenSize } from '@/Core/util/constants';
import useSoundEffect from '@/hooks/useSoundEffect';
import { Button } from '@/UI/Components/Base';

import styles from './OptionVideoSize.module.scss';

interface IProps {
  label?: string;
  onUpdate?: () => void;
}

export const OptionVideoSize: FC<IProps> = (props: IProps) => {
  const dispatch = useDispatch();
  const { playSeEnter, playSeClick } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const [currentValue, setCurrentValue] = useState<videoSizeOption>(videoSizeOption.Size720P);
  const [updateSize, setUpdateSize] = useState<boolean>(false);
  const optionUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.option],
  ) as OptionSceneUIConfig;

  const sizeOptions = [videoSizeOption.Size1080P, videoSizeOption.Size720P];

  function resize() {
    let targetHeight = 1440;
    let targetWidth = 2560;
    const sizeArr = currentValue?.split('x') || [];
    if (sizeArr?.length === 2) {
      targetWidth = parseInt(sizeArr[0]) * 2;
      targetHeight = parseInt(sizeArr[1]) * 2;

      dispatch(setStage({ key: 'storyLineBgX', value: parseInt(sizeArr[0]) }));
      dispatch(setStage({ key: 'storyLineBgY', value: parseInt(sizeArr[1]) }));
    }

    const h = window.innerHeight; // 窗口高度
    const w = window.innerWidth; // 窗口宽度
    const zoomH = h / targetHeight; // 以窗口高度为基准的变换比
    const zoomW = w / targetWidth; // 以窗口宽度为基准的变换比
    const zoomH2 = w / targetHeight; // 竖屏时以窗口高度为基础的变换比
    const zoomW2 = h / targetWidth; // 竖屏时以窗口宽度为基础的变换比
    let mh = (targetHeight - h) / 2; // y轴移动距离
    let mw = (targetWidth - w) / 2; // x轴移动距离
    let mh2os = targetWidth / 2 - w / 2; // 竖屏时 y轴移动距离
    let mw2os = targetHeight / 2 - h / 2; // 竖屏时 x轴移动距离
    let transform = '';
    let ebgTransform = '';
    const root = document.getElementById('root'); // 获取根元素
    const title = document.getElementById('Title_enter_page');
    const ebg = document.getElementById('ebg');
    const elements = [root, title];

    if (root) {
      root.style.width = `${targetWidth}px`;
      root.style.height = `${targetHeight}px`;
    }

    if (title) {
      title.style.width = `${targetWidth}px`;
      title.style.height = `${targetHeight}px`;
    }

    if (w > h) {
      const ebg = document.getElementById('ebg');
      if (ebg) {
        ebg.style.height = `100vh`;
        ebg.style.width = `100vw`;
        ebgTransform = '';
      }
      mw = -mw;
      mh = -mh;
      if (w * (9 / 16) >= h) {
        transform = `translate(${mw}px, ${mh}px) scale(${zoomH},${zoomH})`;
      }
      if (w * (9 / 16) < h) {
        transform = `translate(${mw}px, ${mh}px) scale(${zoomW},${zoomW})`;
      }
    } else {
      /**
       * 旋转
       */
      if (ebg) {
        ebg.style.height = `${targetHeight}px`;
        ebg.style.width = `${targetWidth}px`;
      }
      mw2os = -mw2os;
      if (h * (9 / 16) >= w) {
        ebgTransform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomH2 * 1.75},${zoomH2 * 1.75})`;
        transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomH2},${zoomH2})`;
      }
      if (h * (9 / 16) < w) {
        ebgTransform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomW2 * 1.75},${zoomW2 * 1.75})`;
        transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomW2},${zoomW2})`;
      }

      // @ts-ignore
      if (window && window?.isIOSDevice) {
        const zoomWi = w / targetWidth;
        transform = `translate(${-mw}px, ${-mh}px) scale(${zoomWi},${zoomWi})`;
      }
    }
    if (ebg) {
      ebg.style.transform = ebgTransform;
    }
    for (const element of elements) {
      if (element) {
        element.style.transform = transform;
      }
    }

    setStyleProps(targetWidth, targetHeight);
  }

  useEffect(() => {
    // 在组件加载时和 screenSize 改变时调用 resize 函数
    if (updateSize) {
      resize();
      window.onload = resize;
      window.onresize = resize;
      WebGAL.events.screenSizeChange.emit();
    
      if (webgalStore.getState().GUI.isInGaming) {
        const currentScript: ISentence =
          WebGAL.sceneManager.sceneData.currentScene.sentenceList[WebGAL.sceneManager.sceneData.currentSentenceId - 1];
        runScript(currentScript)
      }


      setTimeout(() => {
        setUpdateSize(false);
      }, 500);
      props?.onUpdate && props.onUpdate?.()
    }
  }, [updateSize]);

  function setStyleProps(targetWidth: number, targetHeight: number) {
    const rootEle = document.documentElement;
    // 修改 CSS 变量的值
    rootEle.style.setProperty('--screenWidth', `${targetWidth}px`);
    rootEle.style.setProperty('--screenHeight', `${targetHeight}px`);

    const MS: 2 | 3 = currentValue === videoSizeOption.Size1080P ? 3 : 2;
    const MSTop: 2 | 3.2 = currentValue === videoSizeOption.Size1080P ? 3.2 : 2;

    const scaleFactor = currentValue === videoSizeOption.Size1080P ? 0.3333 : 0.5;

    rootEle.style.setProperty('--scale-factor', `${scaleFactor}`);

    rootEle.style.setProperty('--options_checkbox_top', `${239 * MS}px`);
    rootEle.style.setProperty('--options_checkbox_left', `${441 * MS}px`);

    rootEle.style.setProperty('--options_checkbox_window_top', `${218 * MSTop}px`);
    rootEle.style.setProperty('--options_checkbox_window_left', `${661 * MS}px`);

    rootEle.style.setProperty('--options_checkbox_1080P_top', `${266 * MSTop}px`);
    rootEle.style.setProperty('--options_checkbox_1080P_left', `${441 * MS}px`);

    rootEle.style.setProperty('--options_checkbox_720P_top', `${266 * MSTop}px`);
    rootEle.style.setProperty('--options_checkbox_720P_left', `${640 * MS}px`);

    rootEle.style.setProperty('--options_light_slider_top', `${375 * MS}px`);
    rootEle.style.setProperty('--options_light_slider_left', `${622 * MS}px`);

    rootEle.style.setProperty('--options_sound_slider_top', `${445 * MS}px`);
    rootEle.style.setProperty('--options_sound_slider_left', `${622 * MS}px`);

    rootEle.style.setProperty('--options_light_main_top', `${510 * MS}px`);
    rootEle.style.setProperty('--options_light_main_left', `${622 * MS}px`);
  }

  function updateTitle_enter_pageStyle() {
    const enter_page = document.getElementById('Title_enter_page');
    const root = document.getElementById('root');
    if (enter_page) {
      enter_page.style.width = `${currentValue === videoSizeOption.Size1080P ? `${1920 * 2}px` : `${1280 * 2}px`}`;
      enter_page.style.height = `${currentValue === videoSizeOption.Size1080P ? `${1080 * 2}px` : `${720 * 2}px`}`;
    }

    if (root) {
      root.style.width = `${currentValue === videoSizeOption.Size1080P ? `${1920 * 2}px` : `${1280 * 2}px`}`;
      root.style.height = `${currentValue === videoSizeOption.Size1080P ? `${1080 * 2}px` : `${720 * 2}px`}`;
    }
  }

  return (
    <div className={styles.OptionVideoSize_main}>
      {props.label && <label className={styles.label}>{props.label}</label>}
      <Button
        key={OptionSceneOtherKey.Option_videoSize1080_checkbox}
        type="checkbox"
        checked={userDataState.optionData.videoSize === videoSizeOption.Size1080P}
        item={optionUIConfigs.other[OptionSceneOtherKey.Option_videoSize1080_checkbox]}
        defaultClass={`${styles.Options_checkbox} ${styles.Options_checkbox_1080P} ${
          userDataState.optionData.videoSize === videoSizeOption.Size1080P ? styles.Options_checkbox_active : ''
        } interactive`}
        onMouseEnter={playSeEnter}
        onChecked={() => {
          playSeClick();
          window.localStorage.setItem('game-screen-size', sizeOptions[0]);
          updateScreenSize(sizeOptions[0]);
          setCurrentValue(sizeOptions[0]);
          updateTitle_enter_pageStyle();
          dispatch(setOptionData({ key: 'videoSize', value: sizeOptions[0] }));
          dispatch(setOptionData({ key: 'textSize', value: textSize.medium }));
          setStorage();
          setUpdateSize(true);
        }}
      />

      <Button
        key={OptionSceneOtherKey.Option_videoSize720_checkbox}
        type="checkbox"
        checked={userDataState.optionData.videoSize === videoSizeOption.Size720P}
        item={optionUIConfigs.other[OptionSceneOtherKey.Option_videoSize720_checkbox]}
        defaultClass={`${styles.Options_checkbox} ${styles.Options_checkbox_720P} ${
          userDataState.optionData.videoSize === videoSizeOption.Size720P ? styles.Options_checkbox_active : ''
        } interactive`}
        onMouseEnter={playSeEnter}
        onChecked={() => {
          playSeClick();
          window.localStorage.setItem('game-screen-size', sizeOptions[1]);
          updateScreenSize(sizeOptions[1]);
          setCurrentValue(sizeOptions[1]);
          updateTitle_enter_pageStyle();
          dispatch(setOptionData({ key: 'videoSize', value: sizeOptions[1] }));
          dispatch(setOptionData({ key: 'textSize', value: textSize.small }));
          setStorage();
          setUpdateSize(true);
        }}
      />
    </div>
  );
};
