import { webgalStore } from '@/store/store';
import axios from 'axios';

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = 'https://test-api.idoltime.games';
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

// 设置 Authorization header
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = webgalStore.getState().userData.token; // 获取 token
    if (token) {
      config.headers = {
        ...config.headers,
        token,
        source: 'web',
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const request = axiosInstance;
