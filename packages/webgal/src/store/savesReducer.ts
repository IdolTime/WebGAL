import { ISaveData, ISaveStoryLineData } from './userDataInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IUnlockAchieveItem } from './stageInterface'
import { getUnlickAchieveFromStorage, dumpUnlickAchieveToStorage } from '@/Core/controller/storage/savesController';

export interface ISavesData {
  saveData: Array<ISaveData>; // 用户存档数据
  quickSaveData: ISaveData | null;
  unlockStorylineList: Array<ISaveStoryLineData>
  saveVideoData: ISaveData | null;
  unlockAchieveData: Array<IUnlockAchieveItem>; // 解锁成就数据
  isShowUnlock: boolean; // 是否显示解锁成就
  unlockAchieveAllTotal: number; // 解锁成就总数
  currentPayerVideoUrlKey: string;  // 档前播放视频的url，用作当当前key值
  isLoadVideo: boolean;
}

const initState: ISavesData = {
  saveData: [],
  quickSaveData: null,
  unlockStorylineList: [], // 保存已经解锁的故事线列表
  saveVideoData: null,
  unlockAchieveData: [],
  isShowUnlock: false,
  unlockAchieveAllTotal: 0,
  currentPayerVideoUrlKey: '',
  isLoadVideo: false
};

interface ISaveStoryLine {
  index: number;
  data: ISaveStoryLineData;
}

interface SaveAction {
  saveData: ISaveData;
  index: number;
}

interface SaveUnlockAchieve {
  index: number;
  data: IUnlockAchieveItem
}

const saveDataSlice = createSlice({
  name: 'saveData',
  initialState: cloneDeep(initState),
  reducers: {
    setFastSave: (state, action: PayloadAction<ISaveData | null>) => {
      state.quickSaveData = action.payload;
    },
    resetFastSave: (state) => {
      state.quickSaveData = null;
    },
    resetSaves: (state) => {
      state.quickSaveData = null;
      state.saveData = [];
    },
    saveGame: (state, action: PayloadAction<SaveAction>) => {
      state.saveData[action.payload.index] = action.payload.saveData;
    },
    replaceSaveGame: (state, action: PayloadAction<ISaveData[]>) => {
      state.saveData = action.payload;
    },
    setStorylineListFromStorage: (state, action: PayloadAction<ISaveStoryLineData[]>) => {
      state.unlockStorylineList = action.payload;
    },
    addStorylineList: (state, action: PayloadAction<ISaveStoryLineData>) => {
      state.unlockStorylineList.push(action.payload)
    },
    replaceStorylineList: (state, action: PayloadAction<ISaveStoryLine>) => {
      // state.unlockStorylineList[action.payload.index].storyLine = action.payload.data.storyLine;
      state.unlockStorylineList[action.payload.index] = {
        ...state.unlockStorylineList[action.payload.index],
        storyLine: action.payload.data.storyLine,
      }
    },
    setSaveVideoData: (state, action: PayloadAction<ISaveData>) => {
      state.saveVideoData = action.payload;
    },
    setUnlockAchieveData: (state, action: PayloadAction<IUnlockAchieveItem[]>) => {
      state.unlockAchieveData = [...action.payload]
    },
    resetUnlockAchieveData: (state) => {
      state.unlockAchieveData = [];
    },
    addUnlockAchieveData: (state, action: PayloadAction<IUnlockAchieveItem>) => {
      state.unlockAchieveData.push(action.payload);
    },
    replaceUnlockAchieveData: (state, action: PayloadAction<SaveUnlockAchieve>) => {
      state.unlockAchieveData[action.payload.index] = action.payload.data;
    },
    setIsShowUnlock: (state, action: PayloadAction<boolean>) => {
      state.isShowUnlock = action.payload;
    },
    setUnlockAchieveAllTotal: (state, action: PayloadAction<number>) => {
      state.unlockAchieveAllTotal = action.payload;
    },
    saveCurrentPayerVideoUrl: (state, action: PayloadAction<string>) => {
      state.currentPayerVideoUrlKey = action.payload;
    },
    setLoadVideo: (state, action: PayloadAction<boolean>) => {
      state.isLoadVideo = action.payload
    },
  },
});

export const saveActions = saveDataSlice.actions;

export default saveDataSlice.reducer;
