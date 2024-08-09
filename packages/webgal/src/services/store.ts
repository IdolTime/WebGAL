import { request } from '@/utils/request';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { setGameInfo, setPaymentConfigurationList } from '@/store/storeReducer';
import { IGameInfo, IRechargeList } from './storeInterface';

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

export const getEditorGameDetail = () => {
  return request
    .post('/editor/game/detail', { gId: WebGAL.gameId })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: null,
        message: '获取游戏信息失败',
      };
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
        data: null,
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
      if (res.data.code === 0) {
        getGameInfo();
      }
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

export const getGameInfo = () => {
  return request
    .get<{ code: number; message: string; data: IGameInfo }>('/game/get_game_info?gId=' + WebGAL.gameId)
    .then((res) => {
      if (res.data.code === 0) {
        webgalStore.dispatch(setGameInfo(res.data.data));
      }
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: null,
        message: '获取游戏信息失败',
      };
    });
};

// 获取充值列表
export const getRechargeList = () => {
  return request
    .post<IRechargeList>('/user/recharge_config_list', { is_show: 1 })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: null,
        message: '获取充值列表失败',
      };
    });
};

// 充值
export const recharge = (recharge_id: number) => {
  return request
    .post('/user/recharge', { recharge_id })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: null,
        message: '充值失败',
      };
    });
};

// 查询充值状态
export const getRechargeStatus = (order_no: string) => {
  return request
    .post<{
      code: number;
      message: string;
      data: {
        order_status: number;
        pay_status: number;
      };
    }>('/user/recharge_status', { order_no })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: null,
        message: '查询充值状态失败',
      };
    });
};
