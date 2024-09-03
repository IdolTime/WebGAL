// 链接形式
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
