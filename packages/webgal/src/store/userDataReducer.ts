/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
import { language } from '@/config/language';
import {
  IAppreciationAsset,
  IOptionData,
  ISaveData,
  ISetOptionDataPayload,
  ISetUserDataPayload,
  IUserData,
  fullScreenOption,
  playSpeed,
  textFont,
  textSize,
  voiceOption,
  videoSizeOption,
} from '@/store/userDataInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { ISetGameVar } from './stageInterface';

const initialOptionSet: IOptionData = {
  slPage: 1,
  volumeMain: 100, // 主音量
  textSpeed: 50, // 文字速度  [0, 100] =>[3, 80]
  autoSpeed: playSpeed.normal, // 自动播放速度
  textSize: textSize.medium,
  vocalVolume: 100, // 语音音量
  bgmVolume: 25, // 背景音乐音量
  seVolume: 100, // 音效音量
  uiSeVolume: 50, // UI音效音量
  textboxFont: textFont.song,
  textboxOpacity: 75,
  language: language.zhCn,
  voiceInterruption: voiceOption.yes,
  fullScreen: fullScreenOption.off,
  uiLight: 100, // UI亮度
  videoSize: videoSizeOption.Size720P,
};

// 初始化用户数据
export const initState: IUserData = {
  optionData: initialOptionSet,
  globalGameVar: {},
  appreciationData: {
    bgm: [],
    cg: [],
  },
  token: '',
  userInfo: {
    nickName: '',
    userId: 0,
  },
};

const userDataSlice = createSlice({
  name: 'userData',
  initialState: cloneDeep(initState),
  reducers: {
    /**
     * 设置用户数据
     * @param state
     * @param action
     */
    setUserData: (state, action: PayloadAction<ISetUserDataPayload>) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    unlockCgInUserData: (state, action: PayloadAction<IAppreciationAsset>) => {
      const { name, url, series, poster } = action.payload;
      // 检查是否存在
      let isExist = false;
      state.appreciationData.cg.forEach((e) => {
        if (url === e.url) {
          isExist = true;
          e.url = url;
          e.series = series;
          e.name = name || url;
          e.poster = poster || '';
        }
      });
      if (!isExist) {
        state.appreciationData.cg.push(action.payload);
      }
    },
    unlockBgmInUserData: (state, action: PayloadAction<IAppreciationAsset>) => {
      const { name, url, series } = action.payload;
      // 检查是否存在
      let isExist = false;
      state.appreciationData.bgm.forEach((e) => {
        if (url === e.url) {
          isExist = true;
          e.url = url;
          e.series = series;
          e.name = name || url;
        }
      });
      if (!isExist) {
        state.appreciationData.bgm.push(action.payload);
      }
    },
    /**
     * 替换用户数据
     * @param state
     * @param action
     */
    resetUserData: (state, action: PayloadAction<IUserData>) => {
      Object.assign(state, action.payload);
    },
    /**
     * 设置选项数据
     * @param state
     * @param action
     */
    setOptionData: (state, action: PayloadAction<ISetOptionDataPayload>) => {
      const { key, value } = action.payload;
      (state.optionData as any)[key] = value;
    },
    /**
     * 修改不跟随存档的全局变量
     * @param state 当前状态
     * @param action 要改变或添加的变量
     */
    setGlobalVar: (state, action: PayloadAction<ISetGameVar>) => {
      state.globalGameVar[action.payload.key] = action.payload.value;
    },
    /**
     * 设置存档/读档页面
     * @param state
     * @param action
     */
    setSlPage: (state, action: PayloadAction<number>) => {
      state.optionData.slPage = action.payload;
    },
    resetOptionSet(state) {
      Object.assign(state.optionData, initialOptionSet);
    },
    resetAllData(state) {
      Object.assign(state, cloneDeep(initState));
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setUserInfo(state, action: PayloadAction<{ userId: number; nickName: string }>) {
      state.userInfo = action.payload;
    },
  },
});

export const {
  setUserData,
  resetUserData,
  setOptionData,
  setGlobalVar,
  setSlPage,
  unlockCgInUserData,
  unlockBgmInUserData,
  resetOptionSet,
  resetAllData,
  setToken,
  setUserInfo,
} = userDataSlice.actions;
export default userDataSlice.reducer;
