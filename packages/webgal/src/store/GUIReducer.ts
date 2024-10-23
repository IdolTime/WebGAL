/**
 * @file 记录当前GUI的状态信息，引擎初始化时会重置。
 * @author Mahiru
 */
import { getStorage } from '@/Core/controller/storage/storageController';
import { sceneUIConfig } from '@/Core/UIConfigTypes';
import {
  IGuiState,
  MenuPanelTag,
  setAssetPayload,
  setVisibilityPayload,
  IShowAffinityChangeItem,
  IShowValueListItem,
} from '@/store/guiInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 成就UI的初始状态
 */
const initStateAchievement = {
  content: '',
  args: {
    hide: true,
    style: {},
    hoverStyle: {},
  },
};

/**
 * ESC菜单按钮初始状态
 */
const initStateEscMenu = {
  content: '',
  args: {
    hide: false,
    style: {
      x: 0,
      y: 0,
      scale: 1,
      fontSize: 0,
      fontColor: '',
      btnImage: '',
      btnSound: '',
      btnPosition: '',
      align: '',
      fontFamily: '',
    },
  },
};

/**
 * 初始GUI状态表
 */
export const initState: IGuiState = {
  isInGaming: false, // 是否在游戏中
  showBacklog: false,
  showStarter: true,
  showTitle: true,
  showMenuPanel: false,
  showTextBox: true,
  showControls: true,
  controlsVisibility: true,
  currentMenuTag: MenuPanelTag.Option,
  titleBg: '',
  titleBgm: '',
  logoImage: [],
  showExtra: false,
  showGlobalDialog: false,
  showPanicOverlay: false,
  isEnterGame: false,
  isShowLogo: true,
  showStoryLine: false,
  showAchievement: false,
  showFavorited: false, // 显示收藏
  gameUIConfigs: sceneUIConfig,
  // gameMenus: [],
  showBeautyGuide: false, // 是否显示美女图鉴页面
  showBeautyGuideDetail: false, // 是否显示美女图鉴详情页面
  showBeautyGuideImageDialog: false,
  isShowR18Modal: false, // 是否显示R18内容
  openR18Modal: false,
  showProgressAndAchievement: false,
  showAffinity: false,
  isShowGameMenu: false,
  escMenus: {
    Esc_continueGame_button: initStateEscMenu,
    Esc_backToLevel_button: initStateEscMenu,
    Esc_setting_button: initStateEscMenu,
    Esc_exitGame_button: initStateEscMenu,
  },
  achievementUI: {
    Achievement_progress_bg: initStateAchievement,
    Achievement_progress_text: initStateAchievement,
    Achievement_progress: initStateAchievement,
    Achievement_notUnlock: initStateAchievement,
    Achievement_back_button: initStateAchievement,
    Achievement_title: initStateAchievement,
  },
  currentPlayAudio: null, // 当前播放的音频
  showAffinityChangeList: [],
  showValueList: [],
};

/**
 * GUI状态的Reducer
 */
const GUISlice = createSlice({
  name: 'gui',
  initialState: initState,
  reducers: {
    /**
     * 设置GUI的各组件的显示状态
     * @param state 当前GUI状态
     * @param action 改变显示状态的Action
     */
    setVisibility: (state, action: PayloadAction<setVisibilityPayload>) => {
      // getStorage();
      const { component, visibility } = action.payload;
      state[component] = visibility;
    },
    /**
     * 设置MenuPanel的当前选中项
     * @param state 当前GUI状态
     * @param action 改变当前选中项的Action
     */
    setMenuPanelTag: (state, action: PayloadAction<MenuPanelTag>) => {
      // getStorage();
      state.currentMenuTag = action.payload;
    },
    /**
     * 设置GUI资源的值
     * @param state 当前GUI状态
     * @param action 改变资源的Action
     */
    setGuiAsset: (state, action: PayloadAction<setAssetPayload>) => {
      const { asset, value } = action.payload;
      state[asset] = value;
    },
    setLogoImage: (state, action: PayloadAction<string[]>) => {
      state.logoImage = [...action.payload];
    },
    setShowStoryLine: (state, action: PayloadAction<boolean>) => {
      state.showStoryLine = action.payload;
    },
    setshowFavorited: (state, action: PayloadAction<boolean>) => {
      state.showFavorited = action.payload;
    },
    setGameUIConfigs: (state, action: PayloadAction<any>) => {
      state.gameUIConfigs = action.payload;
    },
    setGameR18: (state, action: PayloadAction<boolean>) => {
      state.isShowR18Modal = action.payload;
    },
    setEscMenus: (state, action: PayloadAction<any>) => {
      state.escMenus = action.payload;
    },
    setAchievementUI: (state, action: PayloadAction<any>) => {
      state.achievementUI = action.payload;
    },
    setCurrentPlayAudio: (state, action: PayloadAction<HTMLAudioElement | null>) => {
      // @ts-ignore
      state.currentPlayAudio = action.payload;
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
    addShowAffinityChangeList: (state, action: PayloadAction<IShowAffinityChangeItem>) => {
      state.showAffinityChangeList = [...state.showAffinityChangeList, action.payload];
    },
    updateShowAffinityChangeList: (state, action: PayloadAction<IShowAffinityChangeItem[]>) => {
      state.showAffinityChangeList = action.payload;
    },
    removeAffinityChange: (state, action: PayloadAction<number>) => {
      state.showAffinityChangeList = state.showAffinityChangeList.filter((item) => item.key !== action.payload);
    },
  },
});

export const {
  setVisibility,
  setMenuPanelTag,
  setGuiAsset,
  setLogoImage,
  setShowStoryLine,
  setshowFavorited,
  setGameUIConfigs,
  setGameR18,
  setEscMenus,
  setAchievementUI,
  setCurrentPlayAudio,
  addShowAffinityChangeList,
  updateShowAffinityChangeList,
  removeAffinityChange,
  addShowValueList,
  updateShowValueList,
} = GUISlice.actions;
export default GUISlice.reducer;
