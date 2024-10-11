import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { apiEditorChapterEvent } from '@/services/eventData';
import { WebGAL } from '@/Core/WebGAL';
import { getLocalDate } from '@/utils/date';

/**
 * 数据埋点 执行到该语句 上报一次埋点数据
 * @param sentence
 */
export const eventData = (sentence: ISentence): IPerform => {
  const chapterId = sentence.content;

  /** 编辑器章节语句 埋点上报  */
  const gameId = new URLSearchParams(window.location.search).get('gameId') || '';
  const params = {
    thirdUserId: sessionStorage.getItem('sdk-userId') as string,
    productId: String(WebGAL.gameId) || gameId,
    chapterId: Number(chapterId),
    reportTime: getLocalDate(),
    channel: sessionStorage.getItem('sdk-userId') ? 1 : 0,
  };
  apiEditorChapterEvent(params);

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
