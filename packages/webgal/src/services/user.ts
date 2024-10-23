import { webgalStore } from '@/store/store';
import { setUserInfo } from '@/store/userDataReducer';
import { request } from '@/utils/request';

export const getUserInfo = () => {
  return request
    .get<{ code: number; message: string; data: { nickName: string; userId: number } }>('/user/info')
    .then((res) => {
      if (res.data.code === 0) {
        webgalStore.dispatch(setUserInfo(res.data.data));
      }
      return res.data;
    })
    .catch((err) => {
      console.error(err);
      return {
        code: -999,
        data: null,
        message: '登录失败，请重新登录',
      };
    });
};
