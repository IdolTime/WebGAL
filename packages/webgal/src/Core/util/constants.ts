export const SCREEN_CONSTANTS = {
  height: 1440,
  width: 2560,
};

/**
 * 更新屏幕尺寸
 * @param sizeStr 尺寸字符串
 */
export function updateScreenSize(sizeStr?: string) {
  const gameSizeStr = sizeStr || window.localStorage.getItem('game-screen-size');
  const sizeArr = gameSizeStr?.split('x') ?? []
  
  if (sizeArr?.length > 0) {
    SCREEN_CONSTANTS.width = Number(sizeArr[0]) * 2;
    SCREEN_CONSTANTS.height = Number(sizeArr[1]) * 2;
  }

  return SCREEN_CONSTANTS;
}