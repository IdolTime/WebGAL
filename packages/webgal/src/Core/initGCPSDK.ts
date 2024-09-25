// 链接形式
import { WebGAL } from '@/Core/WebGAL';

export const initSdkLink = () => {
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
  };

  const loadCSS = (url: string) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    document.head.appendChild(link);
  };

  if (!hasLink(WebGAL.gameCssLink)) {
    console.log('link1');
    loadCSS(WebGAL.gameCssLink);
  }

  if (!hasScript(WebGAL.gameJsLink)) {
    console.log('js1');
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
