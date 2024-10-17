import { logger } from '@/Core/util/logger';

import { WebGAL } from '@/Core/WebGAL';

export const stopAllPerform = () => {
  logger.warn('清除所有演出');
  const performListCopy = [...WebGAL.gameplay.performController.performList];
  WebGAL.gameplay.performController.resetPerformList();

  for (const e of performListCopy) {
    e.goNextWhenOver = false;
    if (e.performName.startsWith('videoPlay')) {
      e.stopFunction(true);
    } else {
      e.stopFunction();
    }
    clearTimeout(e.stopTimeout as unknown as number);
  }
};
