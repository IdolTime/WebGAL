import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { Style, CollectionImages, contentListItem, CollectionVideos } from '../UIConfigTypes';
import { CSSProperties } from 'react';
import { isEmpty } from 'lodash';
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

export const px2 = (value: number | string) => (typeof value === 'string' ? Number(value) : value) / 0.5;

// 解析样式的工具函数
export function parseStyleArg(styleObj?: Style): CSSProperties {
  const style: CSSProperties = {};

  if (styleObj) {
    if (styleObj.x !== undefined) {
      style.left = px2(styleObj.x) + 'px';
      style.position = 'absolute';
      style.transform = 'translateX(-50%)';
    }
    if (styleObj.y !== undefined) {
      style.top = px2(styleObj.y) + 'px';
      style.position = 'absolute';
      style.transform += ' translateY(-50%)';
    }
    if (styleObj.scale !== undefined) {
      style.transform += ` scale(${styleObj.scale})`;
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
