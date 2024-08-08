import { request } from '@/utils/request';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { setPaymentConfigurationList } from '@/store/storeReducer';

export const getPaymentConfigList = () => {
  return request
    .post('/game/chapter_sales_is_buy', { gId: WebGAL.gameId })
    .then((res) => {
      let list = webgalStore.getState().storeData.paymentConfigurationList;

      if (res.data.code === 0) {
        list = res.data.data;
      }

      webgalStore.dispatch(setPaymentConfigurationList(list));
      return list;
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
};

export const buyChapter = (productId: number) => {
  return request
    .post('/game/buy_chapter', { gId: WebGAL.gameId, productId })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: false,
        message: '购买失败，请稍后重试',
      };
    });
};

export const buyGame = () => {
  return request
    .post('/game/buy', {
      gId: WebGAL.gameId,
    })
    .then((res) => {
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: false,
        message: '购买失败，请稍后重试',
      };
    });
};

// 查询是否购买章节或者选项
export const getIsBuy = (productId: number) => {
  return request
    .post('/game/product_id_is_buy', { gId: WebGAL.gameId, productId })
    .then((res) => {
      if (res.data.code === 0) {
        const list = [...webgalStore.getState().storeData.paymentConfigurationList];
        const index = list.findIndex((item) => item.product_id === productId);

        if (index > -1) {
          const item = { ...list[index] };
          item.is_buy = res.data.data;
          list[index] = item;
          webgalStore.dispatch(setPaymentConfigurationList(list));
        }
      }
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: false,
        message: '获取购买状态失败',
      };
    });
};
