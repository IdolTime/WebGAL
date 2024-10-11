import { apiUserOnlineLogEvent } from '@/services/eventData';
import { WebGAL } from '@/Core/WebGAL';
import { getLocalDate } from '@/utils/date';


//@ts-ignore
let timer: NodeJS.Timer | undefined;

// 启动定时器，每2分钟请求一次数据
export function startEvent() {

    if (timer) {
      clearInterval(timer);
    }

    requestData()

    function requestData() {
      const params = {
          thirdUserId: sessionStorage.getItem('sdk-userId') as string,
          productId: WebGAL.gameId + '',
          reportTime: getLocalDate()
        }
        apiUserOnlineLogEvent(params)
    }
      
    timer = setInterval(requestData, 2 * 60 * 1000); // 2分钟 = 2 * 60 * 1000 毫秒
}

// 清除定时器
export function stopEvent() {
    clearInterval(timer);
}