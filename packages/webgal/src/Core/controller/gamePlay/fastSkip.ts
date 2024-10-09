// 切换自动播放状态
import { stopAuto } from './autoPlay';
import styles from '@/UI/BottomControlPanel/bottomControlPanel.module.scss';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';
import { SYSTEM_CONFIG } from '@/config';

/**
 * 设置 fast 按钮的激活与否
 * @param on
 */
const setButton = (on: boolean) => {
  const autoIcon = document.getElementById('Button_ControlPanel_fast');
  const prefix = styles.singleButton + ' ' + styles.singleButton_fast;
  if (autoIcon) {
    if (on) {
      autoIcon.className = prefix + ' ' + styles.singleButton_fast_active;
    } else autoIcon.className = prefix;
  }
};

/**
 * 停止快进模式
 */
export const stopFast = () => {
  if (!isFast()) {
    return;
  }
  WebGAL.gameplay.isFast = false;
  setButton(false);
  if (WebGAL.gameplay.fastTimeout !== null) {
    clearTimeout(WebGAL.gameplay.fastTimeout);
    WebGAL.gameplay.fastTimeout = null;
  }
};

/**
 * 开启快进
 */
export const startFast = () => {
  if (isFast()) {
    return;
  }

  WebGAL.gameplay.isFast = true;
  setButton(true);

  const fastForward = () => {
    console.log('正在快进语句');
    nextSentence();

    // 模拟 setInterval 的行为，递归调用 setTimeout
    WebGAL.gameplay.fastTimeout = setTimeout(fastForward, 200);
  };

  fastForward();
};

// 判断是否是快进模式
export const isFast = function () {
  return WebGAL.gameplay.isFast;
};

/**
 * 停止快进模式与自动播放
 */
export const stopAll = () => {
  stopFast();
  stopAuto();
};

/**
 * 切换快进模式
 */
export const switchFast = () => {
  // 现在正在快进
  if (WebGAL.gameplay.isFast) {
    stopFast();
  } else {
    // 当前不在快进
    startFast();
  }
};
