import { ISaveData } from './userDataInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { IUnlockAchieveItem } from './stageInterface'
import { getUnlickAchieveFromStorage, dumpUnlickAchieveToStorage } from '@/Core/controller/storage/savesController';

export interface ISavesData {
  saveData: Array<ISaveData>; // 用户存档数据
  quickSaveData: ISaveData | null;
  unlockAchieveData: Array<IUnlockAchieveItem>; // 解锁成就数据
  isShowUnlock: boolean; // 是否显示解锁成就
}

const initState: ISavesData = {
  saveData: [],
  quickSaveData: null,
  unlockAchieveData: [],
  isShowUnlock: false,
};

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
    }
  },
});

export const saveActions = saveDataSlice.actions;

export default saveDataSlice.reducer;
