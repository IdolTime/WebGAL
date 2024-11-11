import axios from 'axios';
import { WebGAL } from '@/Core/WebGAL';
import { request } from '@/utils/request';
import { getLocalDate } from '@/utils/date';


// sdk支付完成上报
export const LogPaySuccess = (params: any) => {
  const { paymentAmount } = params;
  const data = {
    thirdUserId: sessionStorage.getItem('sdk-userId'),
    productId: String(WebGAL.gameId) || WebGAL.gameSdkId,
    payTime: getLocalDate(),
    amount: paymentAmount,
    channel: 1,
  };
  request.post('/third_payment_record_report', data);
};
