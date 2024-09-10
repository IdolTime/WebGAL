import { SceneUIConfig } from '@/Core/UIConfigTypes';
import { IWebGalTextBoxTheme } from '@/Stage/themeInterface';

/**
 * 当前Menu页面显示的Tag
 */
export enum MenuPanelTag {
  Save, // “保存”选项卡
  Load, // “读取”选项卡
  Option, // “设置”选项卡
}

/**
 * @interface IGuiState GUI状态接口
 */
export interface IGuiState {
  isInGaming: boolean; // 是否在游戏中
  showStarter: boolean; // 是否显示初始界面（用于使得bgm可以播放)
  showTitle: boolean; // 是否显示标题界面
  showMenuPanel: boolean; // 是否显示Menu界面
  showTextBox: boolean;
  showControls: boolean;
  controlsVisibility: boolean;
  currentMenuTag: MenuPanelTag; // 当前Menu界面的选项卡
  showBacklog: boolean;
  titleBgm: string; // 标题背景音乐
  titleBg: string; // 标题背景图片
  logoImage: string[];
  showExtra: boolean;
  showGlobalDialog: boolean;
  showPanicOverlay: boolean;
  isEnterGame: boolean;
  isShowLogo: boolean;
  showStoryLine: boolean; // 故事线
  showAchievement: boolean;
  showFavorited: boolean; // 显示收藏
  gameUIConfigs: SceneUIConfig;
  showBeautyGuide: boolean; // 显示美女图鉴页面
  showBeautyGuideDetail: boolean; // 显示美女图鉴详情页面
  showBeautyGuideImageDialog: boolean; // 显示美女图鉴图片对话框
  isShowR18Modal: boolean; // 是否显示R18内容
  openR18Modal: boolean;
  isShowGameMenu: boolean; // 是否显示游戏菜单
  escMenus: {
    [key in EecMenuKey]: EscMenuItem;
  };
  achievementUI: {
    [key in EnumAchievementUIKey]: GameMenuItem;
  };
}

export type componentsVisibility = Pick<
  IGuiState,
  Exclude<
    keyof IGuiState,
    'currentMenuTag' | 'titleBg' | 'titleBgm' | 'logoImage' | 'theme' | 'gameMenus' | 'escMenus' | 'achievementUI'
  >
>;
// 标题资源
export type GuiAsset = Pick<IGuiState, 'titleBgm' | 'titleBg'>;

export interface IGuiStore {
  GuiState: IGuiState;
  setGuiAsset: <K extends keyof GuiAsset>(key: K, value: string) => void;
  setVisibility: <K extends keyof componentsVisibility>(key: K, value: boolean) => void;
  setMenuPanelTag: (value: MenuPanelTag) => void;
}

export interface setVisibilityPayload {
  component: keyof componentsVisibility;
  visibility: boolean;
}

export interface setAssetPayload {
  asset: keyof GuiAsset;
  value: string;
}

export type GuiStore = IGuiStore;

export enum GameMenuKey {
  Game_start_button = 'Game_start_button', // 开始
  Game_achievement_button = 'Game_achievement_button', // 成就
  Game_storyline_button = 'Game_storyline_button', // 故事线
  Game_extra_button = 'Game_extra_button', // bgm和图片收藏
  Game_collection_button = 'Game_collection_button', // 图鉴
  Game_option_button = 'Game_option_button', // 设置
  Game_load_button = 'Game_load_button', // 读取
  Game_continue_button = 'Game_continue_button', // 继续游戏
}

export interface IStyle {
  x?: number;
  y?: number;
  scale?: number;
  image?: string;
  fontSize?: number;
  fontColor?: string;
  countdown?: number;
  width?: number;
  height?: number;
}

export interface GameMenuItem {
  content: string;
  args: {
    hide: boolean;
    style: IStyle;
    hoverStyle?: IStyle;
  };
}

export enum EecMenuKey {
  /** 继续游戏 */
  Esc_continueGame_button = 'Esc_continueGame_button',
  /** 返回关卡 */
  Esc_backToLevel_button = 'Esc_backToLevel_button',
  /** 设置 */
  Esc_setting_button = 'Esc_setting_button',
  /** 退出游戏 */
  Esc_exitGame_button = 'Esc_exitGame_button',
}

export interface EscMenuItem {
  content: string;
  args: {
    hide: boolean;
    style: {
      x?: number;
      y?: number;
      scale?: number;
      image?: string;
      fontSize?: number;
      fontColor?: string;
      countdown?: number;
      btnImage?: string;
      btnPosition: string;
      align: string;
      fontFamily: string;
    };
  };
}

/**
 * 成就页面UI
 */
export enum EnumAchievementUIKey {
  /** 成就返回键 */
  Achievement_back_button = 'Achievement_back_button',
  /** 成就标题 */
  Achievement_title = 'Achievement_title',
  /** 成就进度条背景 */
  Achievement_progress_bg = 'Achievement_progress_bg',
  /** 成就进度条文字 */
  Achievement_progress_text = 'Achievement_progress_text',
  /** 成就进度条 */
  Achievement_progress = 'Achievement_progress',
  /** 未解锁图标元素 */
  Achievement_notUnlock = 'Achievement_notUnlock',
}
