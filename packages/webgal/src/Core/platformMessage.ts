// 平台iframe 传值方式获取data

import { WebGAL } from '@/Core/WebGAL';

const getOrigin = () => {
  const ORIGIN =
    WebGAL.gameJsLink.indexOf('pre-doc.moyibian.com') > -1 ? 'https://pre.moyibian.com' : 'https://masobu.com';
  return ORIGIN;
};
/**
 * 检查是否可以开始游戏
 */
export const platform_isCanStart = () => {
  window.parent.postMessage(
    {
      source: 'cocos',
      data: {
        method: 'IS_CAN_START',
      },
    },
    getOrigin(),
  );
};

/**
 * 获取游戏信息
 */
export const platform_getGameDetail = () => {
  const gameId = new URLSearchParams(window.location.search).get('gameId');
  window.parent.postMessage(
    {
      source: 'cocos',
      data: {
        method: 'GET_GAME_DETAIL',
        id: gameId,
      },
    },
    getOrigin(),
  );
};

/**
 * 获取用户信息
 */
export const platform_getUserInfo = () => {
  const gameId = new URLSearchParams(window.location.search).get('gameId');
  window.parent.postMessage(
    {
      source: 'cocos',
      data: {
        method: 'GET_USER_INFO',
      },
    },
    getOrigin(),
  );
};

/**
 * 拉起充值界面
 */
export const platform_recharge = () => {
  window.parent.postMessage(
    {
      source: 'cocos',
      data: {
        method: 'RECHARGE',
      },
    },
    getOrigin(),
  );
};

/**
 * 购买游戏
 */
export const platform_buyGame = () => {
  window.parent.postMessage(
    {
      source: 'cocos',
      data: {
        method: 'BUY_GAME',
      },
    },
    getOrigin(),
  );
};
