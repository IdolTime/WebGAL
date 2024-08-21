import { IGameVar, IStageState } from './stageInterface';
import { language } from '@/config/language';
import { IBacklogItem } from '@/Core/Modules/backlog';
import { ISceneEntry } from '@/Core/Modules/scene';

/**
 * 播放速度的枚举类型
 */
export enum playSpeed {
  slow, // 慢
  normal, // 中
  fast, // 快
}

export enum textSize {
  small,
  medium,
  large,
}

export enum textFont {
  song,
  hei,
  lxgw,
}

export enum voiceOption {
  yes,
  no,
}

export enum fullScreenOption {
  on,
  off,
}

export enum videoSizeOption {
  Size1080P = '1920x1080', 
  Size720P = '1280x720'
}

/**
 * @interface IOptionData 用户设置数据接口
 */
export interface IOptionData {
  volumeMain: number; // 主音量
  textSpeed: number; // 文字速度
  autoSpeed: playSpeed; // 自动播放速度
  textSize: textSize;
  vocalVolume: number; // 语音音量
  bgmVolume: number; // 背景音乐音量
  seVolume: number; // 音效音量
  uiSeVolume: number; // 用户界面音效音量
  slPage: number; // 存读档界面所在页面
  textboxFont: textFont;
  textboxOpacity: number;
  language: language;
  voiceInterruption: voiceOption; // 是否中断语音
  fullScreen: fullScreenOption;
  uiLight: number; // 游戏UI亮度
  videoSize: videoSizeOption
}

/**
 * 场景存档接口
 * @interface ISaveScene
 */
export interface ISaveScene {
  currentSentenceId: number; // 当前语句ID
  sceneStack: Array<ISceneEntry>; // 场景栈
  sceneName: string; // 场景名称
  sceneUrl: string; // 场景url
}

/**
 * @interface ISaveData 存档文件接口
 */
export interface ISaveData {
  nowStageState: IStageState;
  backlog: Array<IBacklogItem>; // 舞台数据
  index: number; // 存档的序号
  saveName: string; // 当前保存名称
  saveTime: string; // 保存时间
  sceneData: ISaveScene; // 场景数据
  previewImage: string;
}

export interface ISaveVideoData {
  nowStageState: IStageState;
  backlog: Array<IBacklogItem>; // 舞台数据
  saveTime: string; // 保存时间
  sceneData: ISaveScene; // 场景数据
}

export interface IAppreciationAsset {
  name: string;
  url: string;
  series: string;
}

export interface IAppreciation {
  bgm: Array<IAppreciationAsset>;
  cg: Array<IAppreciationAsset>;
}

/**
 * @interface IUserData 用户数据接口
 */
export interface IUserData {
  globalGameVar: IGameVar; // 不跟随存档的全局变量
  optionData: IOptionData; // 用户设置选项数据
  appreciationData: IAppreciation;
  token: string;
}

export interface ISetUserDataPayload {
  key: keyof IUserData;
  value: any;
}

export interface ISetOptionDataPayload {
  key: keyof IOptionData;
  value: any;
}

export interface IUserDataStore {
  userDataState: IUserData;
  setUserData: <K extends keyof IUserData>(key: K, value: any) => void;
  replaceUserData: (newUserData: IUserData) => void;
  setOptionData: <K extends keyof IOptionData>(key: K, value: any) => void;
  setSlPage: (index: number) => void;
}

export type UserDataStore = IUserDataStore;

export interface ISaveStoryLine {
  thumbnailUrl:  string; // 缩略图地址
  name: string; // 解锁名称
  x: number; // 解锁按钮 X坐标
  y: number; // 解锁按钮 Y坐标
  isUnlock: boolean; // 是否已解锁, 如果已经解锁才展示
  isHideName: boolean; // 是否隐藏名称
}

export interface ISaveStoryLineData {
  storyLine: ISaveStoryLine;
  videoData: ISaveData | null;
}

export interface IUnlockAchieveAllItem {
  key: string;
  value: string;
}
