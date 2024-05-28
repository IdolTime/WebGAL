/**
 * @interface INormalButton 普通按钮的参数
 */
import { ChangeEvent, TouchEvent } from 'react';

export interface INormalButton {
  textList: Array<string>;
  functionList: Array<any>;
  currentChecked: number;
}

export interface ISlider {
  uniqueID: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  initValue: number;
  onTouchEnd?: (event: TouchEvent<HTMLInputElement>) => void;
  onTouchMove?: (event: TouchEvent<HTMLInputElement>) => void;
}
