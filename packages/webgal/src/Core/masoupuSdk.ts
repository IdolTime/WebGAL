import { initGCPSDK } from './initGCPSDK';
import { WebGAL } from '@/Core/WebGAL';

export const masoupuSdkInit = () => {
  initGCPSDK();
};

export const masoupuSdkCheck = (cb: Function) => {
  if (!WebGAL.gameId) {
    alert('没有游戏id~');
    return;
  }
  const token = sessionStorage.getItem('sdk-token');
  if (token) {
    // @ts-ignore
    window.globalThis.getGameDetail(WebGAL.gameId, token).then((res: any) => {
      const gameInfo = res.data;
      const { acoinBalance } = res.data;
      const { paymentAmount, id } = gameInfo;
      if (gameInfo.isBuy) {
        cb();
        return;
      }
      if (acoinBalance < paymentAmount) {
        // 充值
        // @ts-ignore
        window.globalThis.openRechargeDialog(token).then((res: any) => {
          console.log('openRechargeDialog success : ', res);
          window.location.reload();
        });
      } else {
        // 购买
        // @ts-ignore
        window.globalThis.openBuyGameDialog(token, id).then((res: any) => {
          console.log('openBuyGameDialog success : ', res);
          cb();
          // todo 买游戏上报
        });
      }
    });
    return;
  }
  // @ts-ignore
  window.globalThis.openLoginDialog().then((res) => {
    sessionStorage.setItem('sdk-token', res.token);
    sessionStorage.setItem('sdk-userId', res.userId);
    window.location.reload();
  });
};
