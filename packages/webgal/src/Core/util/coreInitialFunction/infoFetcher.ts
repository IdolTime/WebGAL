/* eslint-disable complexity */
import axios from 'axios';
import { logger } from '../logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { 
  setGuiAsset, 
  setLogoImage, 
  setGameUIConfigs, 
  initState, 
  setGameR18, 
  setEscMenus,
  setAchievementUI 
} from '@/store/GUIReducer';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { GameMenuItem, GameMenuKey, EecMenuKey, EscMenuItem, EnumAchievementUIKey } from '@/store/guiInterface';
import { setStage } from '@/store/stageReducer';
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
    if (GUIState) {
      const gameUIConfigs = { ...GUIState.gameUIConfigs };
      // @ts-ignore
      const escMenus: Record<EecMenuKey, EscMenuItem> = {};
      let isSHowEscMenu = false;
      // @ts-ignore
      const achievementUI: Record<EnumAchievementUIKey, GameMenuItem> = {}
      let hasAchievement = false;

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

          case 'Game_sound': {
            if (options?.length > 0) {
              const newOptions = options.map((option) => {
                if (typeof option.value === 'string') {
                  const values = option.value?.split(',');
                  if (values?.length && !boolMap.get(values[0])) {
                    option.value = values[1] ? assetSetter(values[1], fileType.bgm) : '';
                  }
                }
                return option;
              });

              dispatch(setStage({ key: 'gameScounds', value: newOptions }));
            }
            break;
          }

          case 'Menu_sound': {
            if (options?.length > 0) {
              const newOptions = options.map((option) => {
                if (typeof option.value === 'string') {
                  const values = option.value?.split(',');
                  if (values?.length && !boolMap.get(values[0])) {
                    option.value = values[1] ? assetSetter(values[1], fileType.bgm) : '';
                  }
                }
                return option;
              });
              dispatch(setStage({ key: 'menuScounds', value: newOptions }));
            }
            break;
          }

          case 'Game_Icon': {
            if (args[0]) {
              const faviconUrl = assetSetter(args[0], fileType.background);
              const dynamicFavicon = document.getElementById('dynamic-favicon') as HTMLLinkElement;
              if (dynamicFavicon) {
                dynamicFavicon.href = faviconUrl + `?t=${new Date().getTime()}`;
              }
            }
            break;
          }

          case EecMenuKey.Esc_continueGame_button:
          case EecMenuKey.Esc_backToLevel_button:
          case EecMenuKey.Esc_setting_button:
          case EecMenuKey.Esc_exitGame_button: {
            if (!options?.length) break;

            let name = '';
            let hide = false;
            const styleObj = {};
            // 需要转换为 number 类型的数组
            const numberArray = ['x', 'y', 'scale', 'fontSize'];

            options?.forEach((item) => {
              // eslint-disable-next-line max-nested-callbacks
              (item.value as string)?.split(',').forEach((pair) => {
                const [key, value] = pair?.split('=') || [];
                if (key === 'name') {
                  name = value;
                } else if (key === 'hide') {
                  hide = boolMap?.get(value) ?? false;
                } else {
                  // @ts-ignore
                  styleObj[key] = numberArray.includes(key) ? Number(value) : value;
                }
              });
            });

            const oldStyle: EscMenuItem['args']['style'] = { ...initState.escMenus[EecMenuKey[command]].args.style };

            escMenus[EecMenuKey[command]] = {
              content: name,
              args: {
                hide,
                style: {
                  ...oldStyle,
                  ...styleObj,
                },
              },
            };

            isSHowEscMenu = true;
            break;
          }

          case EnumAchievementUIKey.Achievement_progress_bg: 
          case EnumAchievementUIKey.Achievement_progress_text:
          case EnumAchievementUIKey.Achievement_notUnlock:
          case EnumAchievementUIKey.Achievement_progress: {
            achievementUI[EnumAchievementUIKey[command]] = getStyle(EnumAchievementUIKey[command], args, options)
            hasAchievement = true;
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
      isSHowEscMenu && dispatch(setEscMenus(escMenus));
      hasAchievement && dispatch(setAchievementUI(achievementUI));
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
      } else if (e.key.toLowerCase().endsWith('style')) {
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
    item.options = item.options ?? [];

    const hasStyle = item.options.some((e) => e.key === 'style');

    if (!hasStyle) {
      item.options.push({ key: 'style', value: '{}' });
    }

    // @ts-ignore
    if (SceneKeyMap[scene].buttons[item.command]) {
      // @ts-ignore
      newOptions[scene].buttons = { ...newOptions[scene].buttons };
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
      newOptions[scene].other = { ...newOptions[scene].other };

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


function getStyle(uiKey: string, args: string[], options: { key: string; value: any }[]) {
  const hide = (options.find((o) => o.key === 'hide')?.value as boolean) || false;
  const styleStr = (options.find((o) => o.key === 'style')?.value as string) || '';
  const hoverStyleStr = (options.find((o) => o.key === 'hoverStyle')?.value as string) || '';

  let styleObj: GameMenuItem['args']['style'] = { ...initState.achievementUI[uiKey as EnumAchievementUIKey].args.style };
  let hoverStyleObj: GameMenuItem['args']['hoverStyle'] = { ...initState.achievementUI[uiKey as EnumAchievementUIKey].args.hoverStyle };

  styleObj = parseStyle(styleStr);
  hoverStyleObj = parseStyle(hoverStyleStr);

  function parseStyle(strStyle: string) {
    const styleRegex = /\{(.*?)\}/;
    const styleMatch = strStyle.match(styleRegex);
    if (styleMatch) {
      const strStyle = styleMatch[1];
      const styleProps = strStyle.split(',');
      const style: any = {};
  
      styleProps.forEach((prop) => {
        const [key, value] = prop.split('=');
        if (key && value) {
          style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
        }
      });
  
      return style;
    }
  }

  return {
    content: args?.length ? args[0] : '',
    args: {
      hide,
      style: styleObj,
      hoverStyle: hoverStyleObj
    },
  };
}
