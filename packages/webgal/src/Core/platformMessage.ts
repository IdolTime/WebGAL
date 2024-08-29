// 平台iframe 传值方式获取data

const ORIGIN = 'https://pre.moyibian.com';
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
    ORIGIN,
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
    ORIGIN,
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
    ORIGIN,
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
    ORIGIN,
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
    ORIGIN,
  );
};
