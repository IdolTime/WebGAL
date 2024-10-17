import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import ReactDOM from 'react-dom';
import { webgalStore } from '@/store/store';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { getRandomPerformName } from '../../Modules/perform/performController';
import { platform_isCanStart, platform_getGameDetail } from '@/Core/platformMessage';
import { LogPaySuccess } from '@/Core/log';
import { sleep } from '@/Core/util/sleep';

/**
 * 结束试玩
 * @param sentence
 */
export const finishTrial = (sentence: ISentence): IPerform => {
  if (webgalStore.getState().storeData.isEditorPreviewMode) {
    return {
      performName: getRandomPerformName(),
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined, // 暂时不用，后面会交给自动清除
      goNextWhenOver: true,
    };
  }

  let timer = {
    current: null as ReturnType<typeof setTimeout> | null,
  };
  const gameInfo = webgalStore.getState().storeData.gameInfo;
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const shouldDisplayModal = { current: false };

  if (gameInfo?.isBuy || gameInfo?.paymentMode === 'free') {
    return {
      performName: getRandomPerformName(),
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined, // 暂时不用，后面会交给自动清除
      goNextWhenOver: true,
    };
  }

  const nextStep = () => {
    // @ts-ignore
    window.pubsub.publish('toaster', { show: true });
    WebGAL.gameplay.performController.unmountPerform('finishTrial');
  };

  const submitBuy = () => {
    playSeClick();
    if (window !== window.top) {
      // @ts-ignore
      window.MessageSaveFunc = nextStep;
      // @ts-ignore
      platform_isCanStart();
    } else {
      const token = sessionStorage.getItem('sdk-token');
      // @ts-ignore
      window.globalThis.getUserInfo(token).then((res: any) => {
        console.warn('getUserInfo success : ', res);
        const gameInfo: any = webgalStore.getState().storeData.gameInfo;
        if (res.code === 401) {
          // @ts-ignore
          window.reload();
          sessionStorage.setItem('sdk-token', '');
          return;
        }
        const { acoinBalance } = res.data;
        const { paymentAmount, id } = gameInfo;
        if (acoinBalance < paymentAmount) {
          // @ts-ignore 充值
          window.globalThis.openRechargeDialog(token).then((res: any) => {
            shouldDisplayModal.current = true;
          });
        } else {
          // @ts-ignore 购买
          window.globalThis.openBuyGameDialog(token, id).then((res: any) => {
            if (res.action === 'CLOSE_DIALOG') {
              shouldDisplayModal.current = true;
              return;
            }
            console.warn('购买res', res);
            LogPaySuccess({ paymentAmount });
            nextStep();
          });
        }
      });
    }
  };
  const checkBuy = (refresh = false) => {
    timer.current = setTimeout(
      () => {
        // @ts-ignore
        window.pubsub.publish('loading', { loading: true });
      },
      refresh ? 0 : 2000,
    );

    const retry = () => {
      showGlogalDialog({
        title: `网络请求失败\n请重新尝试！`,
        rightText: '确定',
        rightFunc: () => checkBuy(true),
      });
    };

    const disposeGameRes = (res: any) => {
      timer.current && clearTimeout(timer.current);
      // @ts-ignore
      window.pubsub.publish('loading', { loading: false });
      if (res) {
        const { paymentMode, isBuy, paymentAmount } = res;
        // 已经付费
        if (paymentMode === 'paid' && isBuy) {
          // @ts-ignore
          shouldDisplayModal.current = false;
          WebGAL.gameplay.performController.unmountPerform('finishTrial');
        } else {
          showGlogalDialog({
            title: `试玩结束`,
            type: 'pay',
            // @ts-ignore
            content: `可以花费${paymentAmount}`,
            suffixContent: '购买完整版继续游玩',
            leftText: '否',
            rightText: '是',
            leftFunc: () => {
              shouldDisplayModal.current = true;
            },
            rightFunc: submitBuy,
          });
        }
      } else {
        retry();
      }
    };

    window.addEventListener('message', (message: any) => {
      const data = message.data;
      const { method, status, response } = data.data;
      if (!method) return;
      if (method === 'IS_CAN_START') {
        if (status) nextStep();
      }
      if (method === 'GET_GAME_DETAIL') {
        disposeGameRes(response.data);
      }
      if (method === 'BUY_GAME') {
        // @ts-ignore
        const { paymentAmount } = webgalStore.getState().storeData.gameInfo;
        LogPaySuccess({ paymentAmount });
        nextStep();
      }
      if (['CHOOSE_MODEL_CLOSE', 'RECHARGE', 'RECHARGE_CLOSE', 'BUY_GAME_CLOSE'].includes(method)) {
        shouldDisplayModal.current = true;
      }
    });

    const gameId = new URLSearchParams(window.location.search).get('gameId');
    const token = sessionStorage.getItem('sdk-token');
    const isPreviewMode = webgalStore.getState().storeData.isEditorPreviewMode;
    const isCurrentPageInIframe = window.self !== window.top;

    const isPlatIframe = isCurrentPageInIframe && !isPreviewMode;
    if (isPlatIframe) {
      platform_getGameDetail();
      return;
    }
    // @ts-ignore
    window.globalThis.getGameDetail(gameId, token).then((res: any) => {
      console.warn('res', res.data);
      disposeGameRes(res.data);
    });
    // @ts-ignore 关闭购买弹窗
    // window.globalThis.closeBuyGameDialog().then(res => {
    //   shouldDisplayModal.current = true;
    // });
    // @ts-ignore 关闭充值弹窗
    // window.globalThis.closeRechargeDialog().then(res => {
    //   shouldDisplayModal.current = true;
    // });
    // @ts-ignore
    // window.globalThis.closeGameItemPurchaseDialog().then(res => {
    //   shouldDisplayModal.current = true;
    // });
  };

  checkBuy();

  const performObject = {
    performName: 'finishTrial',
    duration: 1000 * 60 * 60 * 24 * 3650,
    isHoldOn: false,
    stopFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
      const perform = {
        performName: getRandomPerformName(),
        duration: 0,
        isHoldOn: false,
        stopFunction: () => {},
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
        goNextWhenOver: true,
      };
      WebGAL.gameplay.performController.arrangeNewPerform(perform, sentence, false);
    },
    blockingNext: () => {
      if (shouldDisplayModal.current) {
        checkBuy();
        shouldDisplayModal.current = false;
      }
      return true;
    },
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };

  return performObject;
};
