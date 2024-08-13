import axios from 'axios';
import { logger } from '../logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { setGuiAsset, setLogoImage, setGameMenus, initState, setGameR18 } from '@/store/GUIReducer';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { GameMenuItem, GameMenuKey } from '@/store/guiInterface';

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
      // @ts-ignore
      const gameMenus: Record<GameMenuKey, GameMenuItem> = {};

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

          case GameMenuKey.Game_start_button:
          case GameMenuKey.Game_achievement_button:
          case GameMenuKey.Game_storyline_button:
          case GameMenuKey.Game_extra_button:
          case GameMenuKey.Game_collection_button:
          case GameMenuKey.Game_continue_button:
          case GameMenuKey.Game_load_button:
          case GameMenuKey.Game_option_button: {
            const hide = (options.find((o) => o.key === 'hide')?.value as boolean) || false;
            const styleStr = (options.find((o) => o.key === 'style')?.value as string) || '';

            let styleObj: GameMenuItem['args']['style'] = {};

            const styleRegex = /\{(.*?)\}/;
            const styleMatch = styleStr.match(styleRegex);
            if (styleMatch) {
              const styleStr = styleMatch[1];
              const styleProps = styleStr.split(',');
              const style: any = {}; // Change to specific type if possible

              // Parse each style property
              styleProps.forEach((prop) => {
                const [key, value] = prop.split('=');
                if (key && value) {
                  style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
                }
              });

              styleObj = style;
            }

            gameMenus[GameMenuKey[command]] = {
              content: args[0],
              args: {
                hide,
                style: styleObj,
              },
            };
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

          case 'Game_id': {
            WebGAL.gameId = isNaN(Number(args[0])) ? 0 : Number(args[0]);
            break;
          }

          case 'Game_r18': {
            if (args?.length > 0) {
              dispatch(setGameR18(!!boolMap.get(args[0])));
            }
            break;
          }
        }
      });

      dispatch(setGameMenus(gameMenus));
    }
    window?.renderPromise?.();
    // @ts-ignore
    window.pubsub.publish('gameReady');
    delete window.renderPromise;
    initKey();
  });
};
