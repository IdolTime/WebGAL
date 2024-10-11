/**
 * 数据埋点API
 */

import { request } from '@/utils/request'


interface IPaymantEvent {
    thirdUserId: string; // 三方平台用户id
    productId: string; // 产品id
    amount: number; // 支付金额
    payTime: string; // 支付时间
}

/**
 * 玩家支付上报 --埋点
 */
export const apiPaymantEvent = async (data: IPaymantEvent) => {
    await request.post('/third_payment_record_report', data)
    .then(() => { console.log('玩家支付上报成功！') })
    .catch((err: any) => { console.error('玩家支付上报失败: ', err) })
}


interface IOnlineEvent {
    thirdUserId: string; // 三方平台用户id
    productId: string; // 产品id
    onlineTime: string; // 上报时间
}
/**
 * 玩家开始游戏上报 --埋点
 */
export const apiStartGameEvent = async (data: IOnlineEvent) => {
    await request.post('/third_user_online_report', data)
    .then(() => { console.log('开始游戏上报成功！') })
    .catch((err: any) => { console.error('开始游戏上报失败: ', err) })
}


interface IUserOnlineLogEvent {
    thirdUserId: string; // 三方平台用户id
    productId: string; // 产品id
    reportTime: string; // 上报时间
}
/**
 * 玩家在线记录数据上报 --埋点 (每隔2分钟上报一次)
 */
export const apiUserOnlineLogEvent = async (data: IUserOnlineLogEvent) => {
    await request.post('/third_user_online_log_report', data) // /third_user_online_log_report
    .then(() => { console.log('玩家在线记录 上报成功！') })
    .catch((err: any) => { console.error('玩家在线记录 上报失败: ', err) })
}


interface IEditorChapterEvent {
    thirdUserId: string; // 三方平台用户id
    productId: string; // 产品id
    chapterId?: number; // 章节id
    optionId?: number; // 选项id
    reportTime: string; // 上报时间
}
/**
 * 编辑器上报--埋点
 */
export const apiEditorChapterEvent = async (data: IEditorChapterEvent) => {
    await request.post('/third_product_chapter_report', data)
    .then(() => { console.log('编辑器章节 上报成功！') })
    .catch((err: any) => { console.error('编辑器章节 上报失败: ', err) })
}
