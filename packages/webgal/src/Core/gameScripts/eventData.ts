import axios from 'axios';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';


/**
 * 数据埋点 执行到该语句 上报一次埋点数据
 * @param sentence
 */
export const eventData = (sentence: ISentence): IPerform => {
    const eventId = sentence.content
    console.log('上报数据', eventId);
    debugger;
    if (eventId) {

        const token = sessionStorage.getItem('sdk-token');
        // @ts-ignore
        window.globalThis.getUserInfo(token).then((res: any) => {
          const gameInfo: any = webgalStore.getState().storeData.gameInfo;
          const { acoinBalance } = res.data;
          const { paymentAmount, id } = gameInfo;
        })


        const url = 'https://test-api.idoltime.games/'
        axios.post(url, {
        //   record: JSON.stringify(reportInfo),
        }).then(() => {
          console.log('上报成功')
        }).catch((err) => {
          console.error('上报失败', err)
        });
    }


  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
