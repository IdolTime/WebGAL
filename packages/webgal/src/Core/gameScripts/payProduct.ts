import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React, { useRef } from 'react';
import { webgalStore } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import ProgressBarBackground from '@/assets/imgs/progress-bar-bg.png';
import ProgressBar from '@/assets/imgs/progress-bar.png';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { buyChapter, getIsBuy } from '@/services/store';
import { backToTitle } from '../controller/gamePlay/backToTitle';
import { getRandomPerformName } from '../Modules/perform/performController';

/**
 * 购买章节
 * @param sentence
 */
export const payProduct = (sentence: ISentence): IPerform => {
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
  const productId = Number(sentence.content);
  const item = webgalStore.getState().storeData.paymentConfigurationList.find((e) => e.product_id === productId);
  let name = '';
  let price = item?.sales_amount;
  const shouldDisplayModal = { current: false };

  sentence.args.forEach((e) => {
    switch (e.key) {
      case 'name':
        name = e.value?.toString() ?? '';
        break;
      case 'amount':
        if (!price) {
          price = isNaN(Number(e.value)) ? 0 : Number(e.value);
        }
        break;
    }
  });

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

    const confirmCallback = () => {
      // @ts-ignore
      // window.pubsub.publish('loading', { loading: true });
      buyChapter(productId ?? 0)
        .then((res) => {
          // @ts-ignore
          window.pubsub.publish('loading', { loading: false });

          if (res.code === 0) {
            // @ts-ignore
            window.pubsub.publish('toaster', { show: true, text: '购买成功' });
            WebGAL.gameplay.performController.unmountPerform('payProduct');
          } else if (res.code === 10014) {
            // @ts-ignore
            window.pubsub.publish('toaster', { show: true, text: '余额不足，请充值' });
            // @ts-ignore
            window.pubsub.publish('rechargeModal', {
              successCallback: checkBuy,
              closeCallback: checkBuy,
            });
          } else {
            // @ts-ignore
            window.pubsub.publish('toaster', { show: true, text: res.message });
            checkBuy();
          }
        })
        .catch(() => {
          // @ts-ignore
          window.pubsub.publish('loading', { loading: false });
        });
    };

    getIsBuy(productId)
      .then((res) => {
        timer.current && clearTimeout(timer.current);
        // @ts-ignore
        window.pubsub.publish('loading', { loading: false });
        if (res.code === 0) {
          if (res.data) {
            WebGAL.gameplay.performController.unmountPerform('payProduct');
          } else {
            showGlogalDialog({
              title: `您已进入付费章节`,
              content: `需要花费${price}`,
              suffixContent: '解锁该章节吗？',
              leftText: '否',
              rightText: '是',
              type: 'pay',
              leftFunc: () => {
                shouldDisplayModal.current = true;
                // backToTitle();
              },
              rightFunc: confirmCallback,
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
    performName: 'payProduct',
    duration: 1000 * 60 * 60 * 24 * 3650,
    isHoldOn: false,
    stopFunction: () => {
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
        shouldDisplayModal.current = false;
        checkBuy();
      }
      return true;
    },
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };

  return performObject;
};
