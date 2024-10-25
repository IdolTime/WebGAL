import { webgalStore } from '@/store/store';
import axios from 'axios';

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = 'https://w-api.idoltime.games';
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

// 设置 Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || webgalStore.getState().userData.token; // 获取 token
    const source = urlParams.get('source') || 'web';
    const isPreviewMode = webgalStore.getState().storeData.isEditorPreviewMode;
    const editorToken = localStorage.getItem('editor-token'); // 获取 editor token

    // @ts-ignore
    config.headers = isPreviewMode
      ? {
          ...config.headers,
          editorToken,
          source: 'editor',
        }
      : {
          ...config.headers,
          token,
          source,
        };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const request = axiosInstance;
