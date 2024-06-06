import { ISaveData } from './userDataInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';

export interface ISavesData {
  saveData: Array<ISaveData>; // 用户存档数据
  quickSaveData: ISaveData | null;
  currentPayerVideoUrlKey: string;  // 档前播放视频的url，用作当当前key值
  isLoadVideo: boolean;
}

const initState: ISavesData = {
  saveData: [],
  quickSaveData: null,
  currentPayerVideoUrlKey: '',
  isLoadVideo: false
};

interface SaveAction {
  saveData: ISaveData;
  index: number;
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
    saveCurrentPayerVideoUrl: (state, action: PayloadAction<string>) => {
      state.currentPayerVideoUrlKey = action.payload;
    },
    setLoadVideo: (state, action: PayloadAction<boolean>) => {
      state.isLoadVideo = action.payload
    }
  },
});

export const saveActions = saveDataSlice.actions;

export default saveDataSlice.reducer;
