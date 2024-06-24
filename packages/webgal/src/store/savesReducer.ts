import { ISaveData, ISaveStoryLineData } from './userDataInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import { ISentence } from '@/Core/controller/scene/sceneInterface';

export interface ISavesData {
  saveData: Array<ISaveData>; // 用户存档数据
  quickSaveData: ISaveData | null;
  unlockStorylineList: Array<ISaveStoryLineData>
  saveVideoData: ISaveData | null;
}

const initState: ISavesData = {
  saveData: [],
  quickSaveData: null,
  unlockStorylineList: [], // 保存已经解锁的故事线列表
  saveVideoData: null,
};

interface ISaveStoryLine {
  index: number;
  data: ISaveStoryLineData;
}

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
    }
  },
});

export const saveActions = saveDataSlice.actions;

export default saveDataSlice.reducer;
