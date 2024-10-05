import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { Style, CollectionImages, contentListItem, CollectionVideos } from '../UIConfigTypes';
import { CSSProperties } from 'react';
import { isEmpty } from 'lodash';
import { SCREEN_CONSTANTS, updateScreenSize } from '@/Core/util/constants';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
export type ScriptFunction = (sentence: ISentence) => IPerform;

export interface ScriptConfig {
  scriptType: commandType;
  scriptFunction: ScriptFunction;
  next?: boolean;
}

export interface IConfigInterface extends ScriptConfig {
  scriptString: string;
}

export function ScriptConfig(
  scriptType: commandType,
  scriptFunction: ScriptFunction,
  config?: Omit<ScriptConfig, 'scriptType' | 'scriptFunction'>,
): ScriptConfig {
  return { scriptType, scriptFunction, ...config };
}

export const scriptRegistry: Record<commandType, IConfigInterface> = {} as any;

export function defineScripts<R extends Record<string, Omit<IConfigInterface, 'scriptString'>>>(
  record: R,
): {
  [K in keyof R]: IConfigInterface;
} {
  // eslint-disable-next-line
  const result = {} as Record<keyof R, IConfigInterface>;
  for (const [scriptString, config] of Object.entries(record)) {
    result[scriptString as keyof R] = scriptRegistry[config.scriptType] = { scriptString, ...config };
  }
  return result;
}

export const px2 = (value: number | string) => {
  const num = updateScreenSize().width == 2560 ? 0.5 : 0.33333
  return (typeof value === 'string' ? Number(value) : value) / num;
}

// 解析样式的工具函数
export function parseStyleArg(styleObj?: Style): CSSProperties {
  const style: CSSProperties = {};

  if (styleObj) {
    if (styleObj.x !== undefined) {
      style.left = px2(styleObj.x) + 'px';
      style.position = 'absolute';
      // style.transform = 'translateX(-50%)';
    }
    if (styleObj.y !== undefined) {
      style.top = px2(styleObj.y) + 'px';
      style.position = 'absolute';
      // style.transform += ' translateY(-50%)';
    }
    if (styleObj.scale !== undefined) {
      if (style.transform) {
        style.transform += ` scale(${styleObj.scale})`;
      } else {
        style.transform = `scale(${styleObj.scale})`;
      }
    }
    if (styleObj.fontSize !== undefined) {
      style.fontSize = px2(styleObj.fontSize) + 'px';
    }
    if (styleObj.fontColor !== undefined) {
      style.color = styleObj.fontColor;
    }
    if (styleObj.width !== undefined) {
      style.width = px2(styleObj.width) + 'px';
    }
    if (styleObj.height !== undefined) {
      style.height = px2(styleObj.height) + 'px';
    }
    if (styleObj.marginLeft !== undefined) {
      style.marginLeft = px2(styleObj.marginLeft) + 'px';
    }
    if (styleObj.marginRight !== undefined) {
      style.marginRight = px2(styleObj.marginRight) + 'px';
    }
    if (styleObj.marginTop !== undefined) {
      style.marginTop = px2(styleObj.marginTop) + 'px';
    }
    if (styleObj.marginBottom !== undefined) {
      style.marginBottom = px2(styleObj.marginBottom) + 'px';
    }
    if (styleObj.gap !== undefined) {
      style.gap = px2(styleObj.gap) + 'px';
    }
    if (styleObj.rowGap !== undefined) {
      style.rowGap = px2(styleObj.rowGap) + 'px';
    }
    if (styleObj.columnGap !== undefined) {
      style.columnGap = px2(styleObj.columnGap) + 'px';
    }
    if (styleObj.position) {
      style.position = styleObj.position;
    }
    if (styleObj.alignPosition !== undefined) {
      if (styleObj.alignPosition === 'top-center') {
        style.top = '0';
      } else if (styleObj.alignPosition === 'bottom-center') {
        style.top = 'auto';
        style.bottom = '0';
      }
    }
    if (styleObj.fontColor === undefined && styleObj.customColor !== undefined) {
      style.color = styleObj.customColor;
    }
    if (styleObj.fontColor === undefined && styleObj.customFontSize !== undefined) {
      style.fontSize = px2(styleObj.customFontSize) + 'px';
    }
    if (styleObj.customImage !== undefined) {
      // @ts-ignore
      style.customImage = styleObj.customImage
    }
  }

  return style;
}

export function parseImagesArg(imgs?: CollectionImages): contentListItem[] {
  if (!imgs || isEmpty(imgs)) {
    return [];
  }
  const imgList: contentListItem[] = [];
  Object.keys(imgs).forEach((key) => {
    // @ts-ignore
    const src = imgs[key] as string;
    imgList.push({
      key,
      type: 'image',
      url: assetSetter(src, fileType.ui) as string,
    });
  });

  return imgList;
}

export function parseVideosArg(videos?: CollectionVideos): contentListItem[] {
  if (!videos || isEmpty(videos)) {
    return [];
  }

  const videoList: contentListItem[] = [];
  Object.keys(videos).forEach((key) => {
    // @ts-ignore
    const src = videos[key] as string;
    videoList.push({
      key,
      type: 'video',
      url: assetSetter(src, fileType.video) as string,
    });
  });
  return videoList;
}

// 创建动态光标的CSS动画
export function createCursorAnimation(cursor: { imgs: string[]; interval: number }, type: 'normal' | 'active') {
  const styleSheet = document.createElement('style');
  let keyframes = `
    @keyframes ${type === 'normal' ? '' : 'active-'}cursor-animation {
  `;

  if (!cursor.imgs || cursor.imgs.length === 0) {
    return;
  }

  cursor.imgs.forEach((_img, index) => {
    const img = assetSetter(_img, fileType.ui);
    const percentage = (index / cursor.imgs.length) * 100;
    keyframes += `
      ${percentage}% { cursor: url(${img}), pointer; }
    `;
  });

  keyframes += `
    100% { cursor: url(${assetSetter(cursor.imgs[0], fileType.ui)}), pointer; }
    }
  `;

  const styleArr = [keyframes];

  if (type === 'normal') {
    styleArr.push(
      `#root { animation: cursor-animation ${cursor.interval * cursor.imgs.length}ms infinite steps(${
        cursor.imgs.length
      }); }`,
    );
  } else {
    styleArr.push(
      `.interactive { animation: active-cursor-animation ${cursor.interval * cursor.imgs.length}ms infinite steps(${
        cursor.imgs.length
      }); }`,
    );
  }

  styleSheet.innerHTML = styleArr.join('\n');

  document.head.appendChild(styleSheet);
}

/**
 * 解析游戏变量
 * @param text 变量名
 * @param GameVar 游戏变量
 * @param globalGameVar 全部变量
 * @returns 
 */
export function getGameVar(text: string, GameVar: any, globalGameVar: any): string {
  let value = text;
  if (typeof text === 'string') {
    // 正则匹配花括号
    const pattern = /\{(.+?)\}/;
    // 使用正则表达式进行匹配
    let result = text?.match(pattern);
    if (result) {
      const key = result[1];
      // @ts-ignore
      value = GameVar?.[key]?.toString() ?? globalGameVar?.[key]?.toString() ?? text;
    }
  }

  return value
}
