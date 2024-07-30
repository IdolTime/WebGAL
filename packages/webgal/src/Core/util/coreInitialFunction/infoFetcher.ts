import axios from 'axios';
import { logger } from '../logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { setGuiAsset, setLogoImage, setGameUIConfigs, initState, setGameR18 } from '@/store/GUIReducer';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { GameMenuItem, GameMenuKey } from '@/store/guiInterface';
import {
  AchievementSceneButtonKey,
  AchievementSceneOtherKey,
  bgKey,
  ExtraSceneButtonKey,
  ExtraSceneOtherKey,
  LoadSceneButtonKey,
  LoadSceneOtherKey,
  OptionSceneButtonKey,
  OptionSceneOtherKey,
  Scene,
  SceneKeyMap,
  SceneUIConfig,
  StorylineSceneButtonKey,
  StorylineSceneOtherKey,
  Style,
  TitleSceneButtonKey,
  titleSceneOtherConfig,
  TitleSceneOtherKey,
  TitleSceneUIConfig,
} from '@/Core/UIConfigTypes';
import { WebgalConfig } from 'idoltime-parser/build/types/configParser/configParser';

declare global {
  interface Window {
    renderPromise?: Function;
  }
}

const boolMap = new Map<string | boolean, boolean>([
  ['true', true],
  ['false', false],
  [true, true],
  [false, false],
]);

/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = (url: string) => {
  const GUIState = webgalStore.getState().GUI;
  const dispatch = webgalStore.dispatch;
  axios.get(url).then((r) => {
    let gameConfigRaw: string = r.data;
    const gameConfig = WebgalParser.parseConfig(gameConfigRaw);
    logger.info('获取到游戏信息', gameConfig);
    // 按照游戏的配置开始设置对应的状态
    if (GUIState) {
      const gameUIConfigs = { ...GUIState.gameUIConfigs };

      gameConfig.forEach((e) => {
        const { command, args, options } = e;

        switch (command) {
          case 'Title_img': {
            const titleUrl = assetSetter(args.join(''), fileType.background);
            dispatch(setGuiAsset({ asset: 'titleBg', value: titleUrl }));
            setEbg(titleUrl);
            break;
          }

          case 'Game_Logo': {
            const logoUrlList = args.map((url) => assetSetter(url, fileType.background));
            dispatch(setLogoImage(logoUrlList));
            break;
          }

          case 'Game_cursor': {
            const cursorUrlList = args.map((url) => assetSetter(url, fileType.background));
            if (cursorUrlList?.length) {
              const cursorStyle = cursorUrlList.map((url) => `url('${url}'), auto`).join(', ');
              const styleElement = document.createElement('style');
              styleElement.innerHTML = `
                html, body, div, span { cursor: ${cursorStyle} !important; }
                html:hover, body:hover, div:hover, span:hover { cursor: ${cursorStyle} !important; }
              `;

              document.head.appendChild(styleElement);
            }
            break;
          }

          case 'Title_bgm': {
            const bgmUrl = assetSetter(args[0], fileType.bgm);
            dispatch(setGuiAsset({ asset: 'titleBgm', value: bgmUrl }));
            break;
          }

          case 'Game_name': {
            WebGAL.gameName = args[0];
            document.title = args[0];
            break;
          }

          case 'Game_key': {
            WebGAL.gameKey = args[0];
            getStorage();
            getFastSaveFromStorage();
            getSavesFromStorage(0, 0);
            break;
          }

          case 'Game_r18': {
            if (args?.length > 0) {
              dispatch(setGameR18(!!boolMap.get(args[0])));
            }
            break;
          }
        }

        if (
          (TitleSceneButtonKey[command as TitleSceneButtonKey] || TitleSceneOtherKey[command as TitleSceneOtherKey]) &&
          command !== TitleSceneOtherKey.Title_bgm
        ) {
          const scene = Scene.title;

          parseUIIConfigOptions(gameUIConfigs, scene, e);
        } else if (
          LoadSceneButtonKey[command as LoadSceneButtonKey] ||
          LoadSceneOtherKey[command as LoadSceneOtherKey]
        ) {
          const scene = Scene.load;
          parseUIIConfigOptions(gameUIConfigs, scene, e);
        } else if (
          StorylineSceneButtonKey[command as StorylineSceneButtonKey] ||
          StorylineSceneOtherKey[command as StorylineSceneOtherKey]
        ) {
          const scene = Scene.storyline;
          parseUIIConfigOptions(gameUIConfigs, scene, e);
        } else if (
          AchievementSceneButtonKey[command as AchievementSceneButtonKey] ||
          AchievementSceneOtherKey[command as AchievementSceneOtherKey]
        ) {
          const scene = Scene.achievement;
          parseUIIConfigOptions(gameUIConfigs, scene, e);
        } else if (
          OptionSceneButtonKey[command as OptionSceneButtonKey] ||
          OptionSceneOtherKey[command as OptionSceneOtherKey]
        ) {
          const scene = Scene.option;
          parseUIIConfigOptions(gameUIConfigs, scene, e);
        } else if (
          ExtraSceneButtonKey[command as ExtraSceneButtonKey] ||
          ExtraSceneOtherKey[command as ExtraSceneOtherKey]
        ) {
          const scene = Scene.extra;
          parseUIIConfigOptions(gameUIConfigs, scene, e);
        }
      });

      dispatch(setGameUIConfigs(gameUIConfigs));
    }
    window?.renderPromise?.();
    delete window.renderPromise;
    initKey();
  });
};

function parseUIIConfigOptions(newOptions: SceneUIConfig, scene: Scene, item: WebgalConfig[0]) {
  const parseArgs = (args: WebgalConfig[0]['options'], swapImageContent = '') => {
    const parseStyleString = (styleString: string): Style => {
      let styleObj: Style = {};
      const styleRegex = /\{(.*?)\}/;
      const styleMatch = styleString.match(styleRegex);
      if (styleMatch) {
        const styleStr = styleMatch[1];
        const styleProps = styleStr.split(',');
        const style: any = {};

        // Parse each style property
        styleProps.forEach((prop) => {
          const [key, value] = prop.split('=');
          if (key && value) {
            style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
          }
        });

        styleObj = style;
      }
      return styleObj;
    };

    const parsedArgs: any = { hide: false, style: {} };

    args.forEach((e: any) => {
      if (e.key === 'hide') {
        parsedArgs.hide = e.value === true;
      } else if (e.key.endsWith('Style')) {
        const style = parseStyleString(e.value as string);

        if (e.key === 'style' && swapImageContent) {
          style.image = swapImageContent;
        }

        parsedArgs[e.key] = style;
      }
    });

    return parsedArgs;
  };

  if (SceneKeyMap[scene]) {
    // @ts-ignore
    newOptions[scene] = { ...newOptions[scene] };
    // @ts-ignore
    if (SceneKeyMap[scene].buttons[item.command]) {
      // @ts-ignore
      newOptions[scene].buttons[item.command] = {
        key: item.command,
        content: item.args[0] ?? '',
        args: parseArgs(item.options ?? []),
      };
      // @ts-ignore
    } else if (SceneKeyMap[scene].other[item.command]) {
      let swapContentAndStyle = false;

      if (bgKey[item.command as keyof typeof bgKey]) {
        swapContentAndStyle = true;
      }

      // @ts-ignore
      newOptions[scene].other[item.command] = {
        key: item.command,
        content: swapContentAndStyle ? '' : item.args[0] ?? '',
        args: parseArgs(item.options ?? [], item.args[0]),
      };
    }
  }

  return newOptions;
}
