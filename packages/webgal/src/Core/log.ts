import axios from 'axios';
import { WebGAL } from '@/Core/WebGAL';

const url = 'https://test-api.idoltime.games/editor/third/payment_record_report';

// sdk支付完成上报
export const LogPaySuccess = (payAmount: any) => {
  const reportInfo = {
    userId: sessionStorage.getItem('sdk-userId'),
    gameId: WebGAL.gameId,
    payTime: new Date(),
    from: 'maosupusdk-vg',
    payAmount,
  };
  axios.post(url, {
    record: JSON.stringify(reportInfo),
  });
};
