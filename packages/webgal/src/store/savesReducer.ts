import { ISaveData, ISaveStoryLineData, IUnlockAchieveAllItem } from './userDataInterface';
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
  isUnlockStoryline: boolean; // 是否显示解锁故事线
  unlockAchieveAllTotal: number; // 解锁成就总数
  unlockAchieveListAll: IUnlockAchieveAllItem[];
  isLoadVideo: boolean;
  allUnlockAchieveList: IUnlockAchieveItem[];
  allStorylineData: Array<ISaveStoryLineData>;
}

const initState: ISavesData = {
  saveData: [],
  quickSaveData: null,
  unlockStorylineList: [], // 保存已经解锁的故事线列表
  saveVideoData: null,
  unlockAchieveData: [],
  isShowUnlock: false,
  unlockAchieveAllTotal: 0,
  unlockAchieveListAll: [],
  isLoadVideo: false,
  isUnlockStoryline: false,
  allUnlockAchieveList: [],
  allStorylineData: []
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
    resetStorylineList: (state) => {
      state.unlockStorylineList = [];
    },
    resetUnlockAchieveData: (state) => {
      state.unlockAchieveData = [];
    },
    addUnlockAchieveData: (state, action: PayloadAction<IUnlockAchieveItem>) => {
      const data = [
        ...state.unlockAchieveData,
        action.payload,
      ]
      state.unlockAchieveData = data;
    },
    replaceUnlockAchieveData: (state, action: PayloadAction<SaveUnlockAchieve>) => {
      state.unlockAchieveData[action.payload.index] = action.payload.data;
    },
    setIsShowUnlock: (state, action: PayloadAction<boolean>) => {
      state.isShowUnlock = action.payload;
    },
    setShowStoryline: (state, action: PayloadAction<boolean>) => {
      state.isUnlockStoryline = action.payload;
    },
    setUnlockAchieveAllTotal: (state, action: PayloadAction<number>) => {
      state.unlockAchieveAllTotal = action.payload;
    },
    setUnlockAchieveAll: (state, action: PayloadAction<IUnlockAchieveAllItem[]>) => {
      state.unlockAchieveListAll = action.payload;
    },
    setLoadVideo: (state, action: PayloadAction<boolean>) => {
      state.isLoadVideo = action.payload
    },
    saveAllUnlockAchieveList: (state, action: PayloadAction<IUnlockAchieveItem[]>) => {
      state.allUnlockAchieveList = action.payload
    },
    saveAllStorylineData: (state, action: PayloadAction<ISaveStoryLineData[]>) => {
      state.allStorylineData = action.payload
    }
  },
});

export const saveActions = saveDataSlice.actions;

export default saveDataSlice.reducer;
