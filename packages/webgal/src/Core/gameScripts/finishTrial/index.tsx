import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import ReactDOM from 'react-dom';
import { webgalStore } from '@/store/store';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { buyGame, getGameInfo } from '@/services/store';
import { getRandomPerformName } from '../../Modules/perform/performController';
import BuyGameSuccess from '@/assets/imgs/buy-game-success.png';
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
  let hasTrial = gameInfo?.isFree === 1 && gameInfo?.tryPlay === 2;
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const shouldDisplayModal = { current: false };

  if (
    (hasTrial && gameInfo?.canPlay) ||
    gameInfo?.isFree === 2 ||
    (gameInfo?.isFree === 1 && gameInfo?.tryPlay === 1 && gameInfo.canPlay)
  ) {
    // if (false) {
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

  const submitBuy = async () => {
    playSeClick();
    const res = await buyGame();

    // @ts-ignore
    window.pubsub.publish('loading', { loading: false });

    await sleep(2000);

    if (res.code === 0 || res.code === 10053) {
      // if (res.code === 0) {
      // @ts-ignore
      res.code === 0 && window.pubsub.publish('toaster', { show: true });
      WebGAL.gameplay.performController.unmountPerform('finishTrial');
    } else if (res.code === 10014) {
      // } else if (res.code === 10053) {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: '余额不足, 请充值' });
      // @ts-ignore
      window.pubsub.publish('rechargeModal', {
        successCallback: checkBuy,
        closeCallback: checkBuy,
      });
    } else {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: res.message });
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

    getGameInfo()
      .then((res) => {
        timer.current && clearTimeout(timer.current);
        // @ts-ignore
        window.pubsub.publish('loading', { loading: false });
        if (res.code === 0) {
          const info = res.data;
          if (!info) return;

          // 已经付费
          if (info.isFree === 1 && info.tryPlay === 2 && info.canPlay) {
            // if (false) {
            WebGAL.gameplay.performController.unmountPerform('finishTrial');
          } else {
            // eslint-disable-next-line react/no-deprecated
            // ReactDOM.render(
            //   <div className={styles.FinishTrial_container}>
            //     <div className={styles.FinishTrial_inner}>
            //       <SourceImg src={FinishTrialBg} />
            //       <SourceImg
            //         src={ModalClose}
            //         className={styles.FinishTrial_close}
            //         onMouseEnter={playSeEnter}
            //         onClick={() => {
            //           shouldDisplayModal.current = true;
            //           // eslint-disable-next-line react/no-deprecated
            //           ReactDOM.render(<div />, document.getElementById('chooseContainer'));
            //         }}
            //       />
            //       <span className={styles.FinishTrial_price}>{info.salesAmount}</span>
            //       <div className={styles.FinishTrial_btn} onClick={submitBuy} onMouseEnter={playSeEnter}>
            //         <span className={styles.FinishTrial_btn_text}>继续游玩</span>
            //       </div>
            //     </div>
            //   </div>,
            //   document.getElementById('chooseContainer'),
            // );

            const _info = webgalStore.getState().storeData.gameInfo;

            showGlogalDialog({
              title: `试玩结束`,
              type: 'pay',
              content: `可以花费${_info?.salesAmount}`,
              suffixContent: '购买完整版继续游玩',
              leftText: '否',
              rightText: '是',
              leftFunc: () => {
                shouldDisplayModal.current = true;
                // backToTitle();
              },
              rightFunc: submitBuy,
            });
          }
        } else {
          retry();
        }
      })
      .catch(() => {
        // @ts-ignore
        window.pubsub.publish('loading', { loading: false });
        retry();
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
