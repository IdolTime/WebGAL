import axios from 'axios';
import { logger } from '../logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { setGuiAsset, setLogoImage, setGameMenus } from '@/store/GUIReducer';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';

declare global {
  interface Window {
    renderPromise?: Function;
  }
}
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
      gameConfig.forEach((e) => {
        const { command, args } = e;

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
          
          case 'Game_menu': {
            const boolMap = new Map([
              ['true', true],
              ['false', false]
            ])
            // const keyMap = new Map([
            //   ['achieve', '成就'],
            //   ['storyline', '故事线'],
            //   ['beautyGuide', '美女图鉴']
            // ])
            const menus = args.map((e) => {
              const arr: any = typeof e === 'string' ? e.split('-') : [];
              return {
                menuKey: typeof e === 'string' && arr?.length ? arr[0] : '',
                isShowMenu: typeof e === 'string' && arr?.length ? boolMap.get(arr[1]) : false
              }
            });

            dispatch(setGameMenus(menus));
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
        }
      });
    }
    window?.renderPromise?.();
    delete window.renderPromise;
    initKey();
  });
};
