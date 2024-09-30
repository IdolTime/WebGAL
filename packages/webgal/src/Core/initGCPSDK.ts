// 链接形式
import { WebGAL } from '@/Core/WebGAL';
import axios from 'axios';

// 打点
export const reportData = (res: any) => {
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

export const initSdkLink = (callback: any) => {
  const hasScript = (src: string) => {
    return document.querySelector(`script[src="${src}"]`) !== null;
  };

  const hasLink = (href: string) => {
    return document.querySelector(`link[href="${href}"]`) !== null;
  };

  const loadScript = (url: string) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.head.appendChild(script);
    script.onload = function () {
      callback(); // 当脚本加载完成后执行回调函数
    };
  };

  const loadCSS = (url: string) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    document.head.appendChild(link);
  };

  if (!hasLink(WebGAL.gameCssLink)) {
    loadCSS(WebGAL.gameCssLink);
  }

  if (!hasScript(WebGAL.gameJsLink)) {
    loadScript(WebGAL.gameJsLink);
  }
};

export const initGCPSDK = () => {
  window.onload = () => {
    // @ts-ignore
    window.globalThis.getUserInfo = window.getUserInfo;
    // @ts-ignore
    window.globalThis.getGameDetail = window.getGameDetail;
    // @ts-ignore
    window.globalThis.logout = window.logout;
    // @ts-ignore
    window.globalThis.openLoginDialog = window.openLoginDialog;
    // @ts-ignore
    window.globalThis.closeLoginDialog = window.closeLoginDialog;
    // @ts-ignore
    window.globalThis.openRechargeDialog = window.openRechargeDialog;
    // @ts-ignore
    window.globalThis.closeRechargeDialog = window.closeRechargeDialog;
    // @ts-ignore
    window.globalThis.changeLanguage = window.changeLanguage;
    // @ts-ignore
    window.globalThis.openGameItemPurchaseDialog = window.openGameItemPurchaseDialog;
    // @ts-ignore
    window.globalThis.closeGameItemPurchaseDialog = window.closeGameItemPurchaseDialog;
    // @ts-ignore
    window.globalThis.openBuyGameDialog = window.openBuyGameDialog;
    // @ts-ignore
    window.globalThis.closeBuyGameDialog = window.closeBuyGameDialog;
  };
};
