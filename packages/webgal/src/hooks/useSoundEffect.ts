import { useDispatch } from 'react-redux';
import { EnumScoundType } from '@/store/stageInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { saveActions } from '@/store/savesReducer';


import page_flip_1 from '@/assets/se/page-flip-1.mp3';
import switch_1 from '@/assets/se/switch-1.mp3';
import mouse_enter from '@/assets/se/mouse-enter.mp3';
import dialog_se from '@/assets/se/dialog.mp3';
import click_se from '@/assets/se/click.mp3';


/**
 * 调用音效
 */
const useSoundEffect = () => {
  const dispatch = useDispatch();
  let playSeEntering = false;

  
  const playSoundEffect = (
    soundData: boolean | string | undefined, 
    defaultSound: string,
    customSe?: string // 自定义的音效
  ) => {
    const uiSeAudioEle: HTMLAudioElement | null = webgalStore.getState().saveData.uiSeAudioElement;

    if (soundData && typeof soundData === 'boolean') return;
    
    if (uiSeAudioEle && !customSe) {
      uiSeAudioEle?.pause?.();
      uiSeAudioEle.volume = 0;
      uiSeAudioEle?.remove?.();

      webgalStore.dispatch(saveActions.setSaveStatus({ 
        key: 'uiSeAudioElement', value: null 
      }));
    }

    if (customSe) {
      dispatch(setStage({ key: 'uiSe', value: customSe }));
    }
        
    dispatch(setStage({ key: 'uiSe', value: soundData || defaultSound }));
    playSeEntering = false;
};

  const playSeEnter = () => {
    if (playSeEntering) return
    playSeEntering = true;
    const saveData = webgalStore.getState().saveData;
    // 判断是否在游戏内
    const soundData = webgalStore.getState().GUI.isInGaming 
      ? saveData.gameScounds?.[EnumScoundType.Move]
      : saveData.menuScounds?.[EnumScoundType.Move]

    playSoundEffect(soundData, mouse_enter);
    // dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
  };


  const playSeClick = (customSe?: string) => {
    const saveData = webgalStore.getState().saveData;
    const soundData = webgalStore.getState().GUI.isInGaming 
      ? saveData.gameScounds?.[EnumScoundType.Click]
      : saveData.menuScounds?.[EnumScoundType.Click];

    playSoundEffect(soundData, click_se, customSe);
    // dispatch(setStage({ key: 'uiSe', value: customSe || click_se }));
  };

  const playSeSwitch = () => {
    dispatch(setStage({ key: 'uiSe', value: switch_1 }));
  };

  const playSePageChange = () => {
    dispatch(setStage({ key: 'uiSe', value: page_flip_1 }));
  };

  const playSeDialogOpen = () => {
    const saveData = webgalStore.getState().saveData
    const soundData = webgalStore.getState().GUI.isInGaming 
      ? saveData.gameScounds?.[EnumScoundType.Alert]
      : saveData.menuScounds?.[EnumScoundType.Alert];

    playSoundEffect(soundData, dialog_se);
    // dispatch(setStage({ key: 'uiSe', value: dialog_se }));
  };


  const playSeError = () => {
    const saveData = webgalStore.getState().saveData
    const soundData = webgalStore.getState().GUI.isInGaming 
      ? saveData.gameScounds?.[EnumScoundType.Error]
      : saveData.menuScounds?.[EnumScoundType.Error];

    playSoundEffect(soundData, '');
  };

  return {
    playSeEnter,
    playSeClick,
    playSePageChange,
    playSeDialogOpen,
    playSeSwitch,
  };
};

/**
 * 调用音效（只供 choose.tsx 使用）
 */
export const useSEByWebgalStore = () => {
  const playSeEnter = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
  };
  const playSeClick = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: click_se }));
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};

export default useSoundEffect;
