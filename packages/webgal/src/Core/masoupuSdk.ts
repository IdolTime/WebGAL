import { initGCPSDK } from './initGCPSDK';
import { WebGAL } from '@/Core/WebGAL';
import axios from 'axios';

export const masoupuSdkInit = () => {
  initGCPSDK();
};

const reportData = (res: any) => {
  const isReport = sessionStorage.getItem('sdk-report');
  if (isReport) {
    return;
  }
  const reportInfo = {
    userId: sessionStorage.getItem('sdk-userId'),
    gameId: WebGAL.gameId,
    gameName: res.gameName,
    paymentMode: res.paymentMode,
    isBuy: res.isBuy,
    time: new Date(),
  };
  axios
    .post('https://test-api.idoltime.games/editorLog', {
      record: JSON.stringify(reportInfo),
    })
    .then(() => {
      sessionStorage.setItem('sdk-report', '1');
    })
    .catch((e) => {
      alert(e);
    });
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
      const { paymentAmount, id, paymentMode } = gameInfo;
      console.log('gameInfo', gameInfo);
      // 上报
      reportData(gameInfo);

      if (gameInfo.isBuy || paymentMode === 'free') {
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
          window.location.reload();
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
