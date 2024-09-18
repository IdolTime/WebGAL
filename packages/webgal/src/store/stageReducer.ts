/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import {
  IEffect,
  IFreeFigure,
  ILive2DExpression,
  ILive2DMotion,
  IRunPerform,
  ISetGameVar,
  ISetStagePayload,
  IStageState,
  IUnlockAchieveObj,
  IShowValueItem,
  IShowValueListItem,
} from '@/store/stageInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { commandType } from '@/Core/controller/scene/sceneInterface';

function initGameScreen() {
  let defaultWidth = 1280;
  let defaultHeight = 720;
  const gameSizeStr = window.localStorage.getItem('game-screen-size');
  const sizeArr = gameSizeStr?.split('x') ?? [];

  if (sizeArr?.length > 0) {
    defaultWidth = Number(sizeArr[0]);
    defaultHeight = Number(sizeArr[1]);
  }

  return {
    defaultWidth,
    defaultHeight,
  };
}

// 初始化舞台数据
export const initState: IStageState = {
  oldBgName: '',
  bgName: '', // 背景文件地址（相对或绝对）
  bgX: 0, // 背景x坐标
  bgY: 0, // 背景y坐标
  figName: '', // 立绘_中 文件地址（相对或绝对）
  figNameLeft: '', // 立绘_左 文件地址（相对或绝对）
  figNameRight: '', // 立绘_右 文件地址（相对或绝对）
  freeFigure: [],
  figureAssociatedAnimation: [],
  showText: '', // 文字
  showTextSize: -1,
  showName: '', // 人物名
  command: '', // 语句指令
  choose: [], // 选项列表，现在不用，先预留
  vocal: '', // 语音 文件地址（相对或绝对）
  playVocal: '', // 语音，真实的播放音频
  vocalVolume: 100, // 语音 音量调整（0 - 100）
  bgm: {
    // 背景音乐
    src: '', // 背景音乐 文件地址（相对或绝对）
    enter: 0, // 背景音乐 淡入或淡出的毫秒数
    volume: 100, // 背景音乐 音量调整（0 - 100）
  },
  hasCustomClickSe: false,
  uiSe: '', // 用户界面音效 文件地址（相对或绝对）
  gameSe: '', // 游戏内页面音效 文件地址（相对或绝对）
  gameScounds: [], // 游戏内音效
  menuScounds: [], // 菜单内音效
  miniAvatar: '', // 小头像 文件地址（相对或绝对）
  GameVar: {}, // 游戏内变量
  effects: [], // 应用的效果
  bgFilter: '', // 现在不用，先预留
  bgTransform: '', // 现在不用，先预留
  PerformList: [], // 要启动的演出列表
  currentDialogKey: 'initial',
  live2dMotion: [],
  live2dExpression: [],
  // currentPerformDelay: 0
  currentConcatDialogPrev: '',
  enableFilm: '',
  isDisableTextbox: false,
  replacedUIlable: {},
  storyLineBg: '', // 故事线背景
  storyLineBgX: initGameScreen().defaultWidth, // 故事线背景长度
  storyLineBgY: initGameScreen().defaultHeight, // 故事线背景宽度
  achieveBg: '', // 成就背景
  unlockAchieve: {
    // 解锁成就
    unlockname: '',
    saveTime: '',
    url: '',
    x: 0,
    y: 0,
  },
  achieveBgX: initGameScreen().defaultWidth,
  achieveBgY: initGameScreen().defaultHeight,
  unlockAchieves: [],
  totalAchievements: 0, // 总成就数量
  unlockedAchievements: 0, // 已获得的成就数量
  // isShowUnlockAchieve: false,
  isShowValueSwitch: false,
  showValueName: '',
  showValueAxisX: 0,
  showValueAxisY: 0,
  showValues: [],
  showValueList: [],
};

/**
 * 创建舞台的状态管理
 */
const stageSlice = createSlice({
  name: 'stage',
  initialState: cloneDeep(initState),
  reducers: {
    /**
     * 替换舞台状态
     * @param state 当前状态
     * @param action 替换的状态
     */
    resetStageState: (state, action: PayloadAction<IStageState>) => {
      Object.assign(state, action.payload);
    },
    /**
     * 设置舞台状态
     * @param state 当前状态
     * @param action 要替换的键值对
     */
    setStage: (state, action: PayloadAction<ISetStagePayload>) => {
      // @ts-ignore
      state[action.payload.key] = action.payload.value;
    },
    /**
     * 修改舞台状态变量
     * @param state 当前状态
     * @param action 要改变或添加的变量
     */
    setStageVar: (state, action: PayloadAction<ISetGameVar>) => {
      state.GameVar[action.payload.key] = action.payload.value;
    },
    updateEffect: (state, action: PayloadAction<IEffect>) => {
      const { target, transform } = action.payload;
      // 尝试找到待修改的 Effect
      const effectIndex = state.effects.findIndex((e) => e.target === target);
      if (effectIndex >= 0) {
        // Update the existing effect
        state.effects[effectIndex].transform = transform;
      } else {
        // Add a new effect
        state.effects.push({
          target,
          transform,
        });
      }
    },
    removeEffectByTargetId: (state, action: PayloadAction<string>) => {
      const index = state.effects.findIndex((e) => e.target === action.payload);
      if (index >= 0) {
        state.effects.splice(index, 1);
      }
    },
    addPerform: (state, action: PayloadAction<IRunPerform>) => {
      state.PerformList.push(action.payload);
    },
    removePerformByName: (state, action: PayloadAction<string>) => {
      for (let i = 0; i < state.PerformList.length; i++) {
        const performItem: IRunPerform = state.PerformList[i];
        if (performItem.id === action.payload) {
          state.PerformList.splice(i, 1);
          i--;
        }
      }
    },
    removeAllPixiPerforms: (state, action: PayloadAction<undefined>) => {
      for (let i = 0; i < state.PerformList.length; i++) {
        const performItem: IRunPerform = state.PerformList[i];
        if (performItem.script.command === commandType.pixi) {
          state.PerformList.splice(i, 1);
          i--;
        }
      }
    },
    setFreeFigureByKey: (state, action: PayloadAction<IFreeFigure>) => {
      const currentFreeFigures = state.freeFigure;
      const newFigure = action.payload;
      const index = currentFreeFigures.findIndex((figure) => figure.key === newFigure.key);
      if (index >= 0) {
        currentFreeFigures[index].basePosition = newFigure.basePosition;
        currentFreeFigures[index].name = newFigure.name;
      } else {
        // 新加
        if (newFigure.name !== '') currentFreeFigures.push(newFigure);
      }
    },
    setLive2dMotion: (state, action: PayloadAction<ILive2DMotion>) => {
      const { target, motion } = action.payload;

      const index = state.live2dMotion.findIndex((e) => e.target === target);

      if (index < 0) {
        // Add a new motion
        state.live2dMotion.push({ target, motion });
      } else {
        // Update the existing motion
        state.live2dMotion[index].motion = motion;
      }
    },
    setLive2dExpression: (state, action: PayloadAction<ILive2DExpression>) => {
      const { target, expression } = action.payload;

      const index = state.live2dExpression.findIndex((e) => e.target === target);

      if (index < 0) {
        // Add a new expression
        state.live2dExpression.push({ target, expression });
      } else {
        // Update the existing expression
        state.live2dExpression[index].expression = expression;
      }
    },
    replaceUIlable: (state, action: PayloadAction<[string, string]>) => {
      state.replacedUIlable[action.payload[0]] = action.payload[1];
    },
    setStoryLineBg: (state, action: PayloadAction<string>) => {
      state.storyLineBg = action.payload;
    },
    setAchieveBg: (state, action: PayloadAction<string>) => {
      state.achieveBg = action.payload;
    },
    setUnlockAchieve: (state, action: PayloadAction<IUnlockAchieveObj>) => {
      state.unlockAchieves.push(action.payload);
    },
    addShowValues: (state, action: PayloadAction<IShowValueItem>) => {
      state.showValues.push(action.payload);
    },
    addShowValueList: (state, action: PayloadAction<IShowValueListItem>) => {
      const index = state.showValueList.findIndex((e) => e.showValueName === action.payload.showValueName);

      if (index > -1) {
        const list = [...state.showValueList];
        list[index] = action.payload;
        state.showValueList = list;
      } else {
        state.showValueList = [...state.showValueList, action.payload];
      }
    },
    updateShowValueList: (state, action: PayloadAction<IShowValueListItem[]>) => {
      state.showValueList = action.payload;
    },
  },
});

export const {
  resetStageState,
  setStage,
  setStageVar,
  setAchieveBg,
  setUnlockAchieve,
  setStoryLineBg,
  addShowValues,
  addShowValueList,
  updateShowValueList,
} = stageSlice.actions;
export const stageActions = stageSlice.actions;
export default stageSlice.reducer;
