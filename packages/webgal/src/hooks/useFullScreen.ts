import { setStorage } from '@/Core/controller/storage/storageController';
import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { keyboard } from './useHotkey';
import { enterFullscreen } from '@/Core/parser/utils';

export function useFullScreen() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const isEnterGame = GUIState.isEnterGame;

  useEffect(() => {
    switch (fullScreen) {
      case fullScreenOption.on: {
        if (isEnterGame) {
          const isCurrentPageInIframe = window.self !== window.top;

          if (isCurrentPageInIframe) {
            // 浏览器限制跨域下不能全屏
            return;
          }

          enterFullscreen();
          if (keyboard) keyboard.lock(['Escape', 'F11']);
        }
        break;
      }
      case fullScreenOption.off: {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          if (keyboard) keyboard.unlock();
        }
        break;
      }
    }
  }, [fullScreen]);
}
