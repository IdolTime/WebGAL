import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import ReactDOM from 'react-dom';
import { webgalStore } from '@/store/store';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { getRandomPerformName } from '../../Modules/perform/performController';
import { platform_isCanStart, platform_getGameDetail } from '@/Core/platformMessage';

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

  const submitBuy = () => {
    playSeClick();
    if (window !== window.top) {
      platform_isCanStart();
    } else {
      const token = sessionStorage.getItem('sdk-token');
      // @ts-ignore
      window.globalThis.getUserInfo(token).then((res: any) => {
        console.log('getUserInfo success : ', res);
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
          // 充值
          // @ts-ignore
          window.globalThis.openRechargeDialog(token).then((res: any) => {
            shouldDisplayModal.current = true;
          });
        } else {
          // 购买
          // @ts-ignore
          // setTimeout(() => {
          //   console.log('openBuyGameDialog success : ', res);
          //   // @ts-ignore
          //   window.pubsub.publish('toaster', { show: true });
          //   WebGAL.gameplay.performController.unmountPerform('finishTrial');
          // }, 3000);
          window.globalThis.openBuyGameDialog(token, id).then((res: any) => {
            console.log('openBuyGameDialog success : ', res);
            // @ts-ignore
            window.pubsub.publish('toaster', { show: true });
            WebGAL.gameplay.performController.unmountPerform('finishTrial');
          });
        }
      });
    }
  };

  const isTryPlay = () => {
    const sceneData = WebGAL.sceneManager.sceneData;
    const res = sceneData.currentScene.sentenceList.filter((item: any) => {
      return item.commandRaw === 'finishTrial' && item.content === 'true';
    });
    return res.length > 0;
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
        const { paymentMode, isBuy } = res;
        // 已经付费
        if (paymentMode === 'paid' && isBuy) {
          // @ts-ignore
          shouldDisplayModal.current = false;
          WebGAL.gameplay.performController.unmountPerform('finishTrial');
        } else {
          const _info = webgalStore.getState().storeData.gameInfo;
          showGlogalDialog({
            title: `试玩结束`,
            type: 'pay',
            // @ts-ignore
            content: `可以花费${_info?.paymentAmount}`,
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
      const { method } = message.data.data;
      if (method === 'IS_CAN_START') {
        console.log('message.data.data', message.data.data);
        // @ts-ignore
        window.pubsub.publish('toaster', { show: true });
        WebGAL.gameplay.performController.unmountPerform('finishTrial');
      }
      if (method === 'GET_GAME_DETAIL') {
        disposeGameRes(data.data.response.data);
      }
      // todo
      // 关闭弹窗 消息
    });

    const gameId = new URLSearchParams(window.location.search).get('gameId');
    const token = sessionStorage.getItem('sdk-token');

    // @ts-ignore
    const is_terre = window?.top[0]?.origin?.indexOf('localhost') > -1;
    const isPlatIframe = window !== window.top && !is_terre;
    if (isPlatIframe && isTryPlay()) {
      platform_getGameDetail();
      return;
    }
    // @ts-ignore
    window.globalThis.getGameDetail(gameId, token).then((res: any) => {
      console.log('res', res.data);
      disposeGameRes(res.data);
    });
    // @ts-ignore 关闭购买弹窗
    window.globalThis.closeBuyGameDialog(() => {
      shouldDisplayModal.current = true;
    });
    // @ts-ignore 关闭充值弹窗
    window.globalThis.closeGameItemPurchaseDialog(() => {
      shouldDisplayModal.current = true;
    });
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
