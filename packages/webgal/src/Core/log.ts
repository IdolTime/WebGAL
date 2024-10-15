import axios from 'axios';
import { WebGAL } from '@/Core/WebGAL';

const url = 'https://test-api.idoltime.games/third_payment_record_report';

// sdk支付完成上报
export const LogPaySuccess = (params: any) => {
  const { paymentAmount } = params;
  const gameId = new URLSearchParams(window.location.search).get('gameId') || '';
  const reportInfo = {
    thirdUserId: sessionStorage.getItem('sdk-userId'),
    productId: String(WebGAL.gameId) || gameId,
    payTime: new Date(),
    amount: paymentAmount,
    channel: 1,
  };
  axios.post(url, {
    record: JSON.stringify(reportInfo),
  });
};
