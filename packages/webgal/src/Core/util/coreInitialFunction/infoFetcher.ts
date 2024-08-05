import axios from 'axios';
import { logger } from '../logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { setGuiAsset, setLogoImage, setGameMenus, initState, setGameR18, setEscMenus } from '@/store/GUIReducer';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { GameMenuItem, GameMenuKey, EecMenuKey, EscMenuItem } from '@/store/guiInterface';
import { setStage } from '@/store/stageReducer';

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
      // @ts-ignore
      const gameMenus: Record<GameMenuKey, GameMenuItem> = {};
      // @ts-ignore
      const escMenus: Record<EecMenuKey, EscMenuItem> = {};
      let isSHowEscMenu = false;

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

            let styleObj: GameMenuItem['args']['style'] = { ...initState.gameMenus.Game_achievement_button.args.style };

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

          case 'Game_r18': {
            if (args?.length > 0) {
              dispatch(setGameR18(!!boolMap.get(args[0])));
            }
            break;
          }

          case 'Game_sound': {
            console.log(args, options)
            if (options?.length > 0) {
              const newOptions = options.map((option) => {
                if (typeof option.value === 'string') {
                  const values = option.value?.split(',');
                  if (values?.length && !boolMap.get(values[0])) {
                    option.value = values[1] ? assetSetter(values[1], fileType.bgm) : '';
                  }
                }
                return option;
              })

              dispatch(setStage({ key: 'gameScounds', value: newOptions }));

              // options.forEach((option) => {
              //   switch (option.key) {
              //     case 'click': {
              //       if (typeof option.value === 'string') {
              //         const values = option.value?.split(',');
              //         if (values?.length > 0 && !boolMap.get(values[0])) {
              //             if (values[1] && values[1] !== '') {
              //               const menuClickSoundUrl = assetSetter(values[1], fileType.bgm);
              //               dispatch(setStage({ key: 'gameSe', value: menuClickSoundUrl }));
              //             }
              //         } else {
              //           dispatch(setStage({ key: 'gameSe', value: '' }));
              //         }
              //       } else {
              //         dispatch(setStage({ key: 'gameSe', value: '' }));
              //       }
              //       break;  
              //     }
              //     case 'move': {
              //       break;  
              //     }
              //   }
              // })
            }
            break;
          }

          case 'Menu_sound': {
            console.log(args, options)
            if (options?.length > 0) {
              const newOptions = options.map((option) => {
                if (typeof option.value === 'string') {
                  const values = option.value?.split(',');
                  if (values?.length && !boolMap.get(values[0])) {
                    option.value = values[1] ? assetSetter(values[1], fileType.bgm) : '';
                  }
                }
                return option;
              })
              dispatch(setStage({ key: 'menuScounds', value: newOptions }));
            }
            break;
          }

          case EecMenuKey.Esc_continueGame_button:
          case EecMenuKey.Esc_backToLevel_button:
          case EecMenuKey.Esc_setting_button:
          case EecMenuKey.Esc_exitGame_button: {

            if (!options?.length) break;
            
            let name = '',
                hide = false;
            const styleObj = {};
            // 需要转换为 number 类型的数组
            const numberArray = ['x', 'y', 'scale', 'fontSize',];

            options?.forEach((item) => {
              (item.value as string)?.split(',').forEach(pair => {
                const [key, value] = pair?.split('=');
                if (key === 'name') {
                  name = value;
                } else if ( key === 'hide') {
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
                  ...styleObj
                },
              },
            };

            isSHowEscMenu = true;
            break;
          }
        }
      });
      
      dispatch(setGameMenus(gameMenus));
      isSHowEscMenu && dispatch(setEscMenus(escMenus));
    }
    window?.renderPromise?.();
    delete window.renderPromise;
    initKey();
  });
};
