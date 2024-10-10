import axios from 'axios';
import { WebGAL } from '@/Core/WebGAL';

const url = 'https://test-api.idoltime.games/editor/third/payment_record_report';

// sdk支付完成上报
export const LogPaySuccess = (params: any) => {
  const { paymentAmount, from } = params;
  const reportInfo = {
    thirdUserId: sessionStorage.getItem('sdk-userId'),
    productId: WebGAL.gameId,
    payTime: new Date(),
    amount: paymentAmount,
    from,
  };
  axios.post(url, {
    record: JSON.stringify(reportInfo),
  });
};
