import {
  ButtonItem,
  ContainerItem,
  IndicatorContainerItem,
  SliderContainerItem,
  Style,
  UIItemConfig,
} from '@/Core/UIConfigTypes';
import React, { ChangeEvent, CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { parseStyleArg } from '@/Core/parser/utils';
import useSoundEffect from '@/hooks/useSoundEffect';
import BarBg from '@/assets/imgs/bar-bg.png';
import BarSlider from '@/assets/imgs/bar-checked.png';

import './slider.scss';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

export const CustomText = ({
  text,
  defaultClass,
  defaultHoverClass,
  style,
  hoverStyle,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  text: string;
  defaultClass?: string;
  defaultHoverClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}) => {
  const [hover, setHover] = useState(false);
  let className = defaultClass;
  let _style = style;

  const _onMouseEnter = () => {
    if (hoverStyle) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  const _onMouseLeave = () => {
    setHover(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  if (hover) {
    className = `${defaultClass} ${defaultHoverClass}`;
    _style = { ...style, ...hoverStyle };
  }

  return (
    <span
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onClick={onClick}
      style={_style}
    >
      {text}
    </span>
  );
};

export const CustomImage = ({
  src,
  hoverSrc,
  defaultClass,
  defaultHoverClass,
  style,
  hoverStyle,
  onMouseEnter,
  onMouseLeave,
  onClick,
  nId,
}: {
  src: string;
  hoverSrc?: string;
  defaultClass?: string;
  defaultHoverClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  nId?: string;
}) => {
  const [hover, setHover] = useState(false);
  const [_, _forceRender] = useState(0);
  const forceRender = () => _forceRender((i) => i + 1);
  const imgLayout = useRef<{ width?: number; height?: number }>({ width: undefined, height: undefined });
  let className = defaultClass;
  let _style = style || {};

  const _onMouseEnter = () => {
    if (hoverStyle) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  const _onMouseLeave = () => {
    setHover(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  if (hover) {
    className = `${defaultClass} ${defaultHoverClass}`;
    _style = { ...style, ...hoverStyle };
  }

  if (_style.width === undefined) {
    _style.width = imgLayout.current.width;
    _style.height = imgLayout.current.height;
  }

  return (
    <img
      id={nId}
      src={hover && hoverSrc ? hoverSrc : src}
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      style={_style}
      onClick={onClick}
      onLoad={(e) => {
        if (_style.width === undefined) {
          imgLayout.current.width = e.currentTarget.naturalWidth;
          imgLayout.current.height = e.currentTarget.naturalHeight;
          forceRender();
        }
      }}
    />
  );
};

export const CustomContainer = ({
  children,
  defaultClass,
  defaultHoverClass,
  style,
  hoverStyle,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  children: ReactNode;
  defaultClass?: string;
  defaultHoverClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e: any) => void;
}) => {
  const [hover, setHover] = useState(false);
  let className = defaultClass;
  let _style = style;
  const _onMouseEnter = () => {
    if (hoverStyle) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  };
  const _onMouseLeave = () => {
    setHover(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };
  if (hover) {
    className = `${defaultClass} ${defaultHoverClass}`;
    _style = { ...style, ...hoverStyle };
  }

  return (
    <div
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onClick={onClick}
      style={_style}
    >
      {children}
    </div>
  );
};

type Item = ButtonItem | SliderContainerItem | IndicatorContainerItem | ContainerItem;

export const BgImage = ({ item, defaultClass, key }: { item: Item; defaultClass?: string; key?: string }) => {
  if (item.args.hide) return null;
  const style = parseStyleArg(item.args.style);
  const src = assetSetter(item.args.style?.image || '', fileType.background);

  if (!item.args.style?.image) return <div className={defaultClass} style={style} />;

  return <CustomImage key={key} defaultClass={defaultClass} src={src} style={style} />;
};

export const Button = ({
  item,
  defaultClass,
  defaultTextClass,
  key,
  defaultHoverClass,
  onMouseEnter,
  onMouseLeave,
  onClick,
  type = 'button',
  checked = false,
  onChecked = () => {},
}: {
  item: ButtonItem;
  defaultClass?: string;
  defaultTextClass?: string;
  defaultHoverClass?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  key?: string;
  type?: 'button' | 'checkbox';
  checked?: boolean;
  onChecked?: (checked: boolean) => void;
}) => {
  if (item.args.hide) return null;
  const style = parseStyleArg(item.args.style);
  const hoverStyle = parseStyleArg(item.args.hoverStyle);
  const src = item.args.style?.image || '';
  const hoverSrc = item.args.hoverStyle?.image || src;
  const menu = item as ButtonItem;
  const imgStyle: CSSProperties = {};
  const textStyle: CSSProperties = src
    ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    : {};
  if (style.width) imgStyle.width = style.width;
  if (style.height) imgStyle.height = style.height;
  // if (!style.position) style.position = 'absolute';
  // if (src) style.backgroundImage = 'none';
  if (src) {
    style.backgroundImage = `url(${assetSetter(src, fileType.ui)})`;
    style.backgroundSize ='100% 100%';
    style.backgroundRepeat = 'no-repeat';
  }

  const clickCallback = (event: React.MouseEvent<HTMLDivElement>) => {
    if (type === 'checkbox') {
      onChecked(!checked);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <CustomContainer
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={clickCallback}
      defaultClass={defaultClass}
      defaultHoverClass={defaultHoverClass}
      style={style}
      hoverStyle={hoverStyle}
      key={key}
    >
      {/* {!!src && <CustomImage src={assetSetter(src, fileType.ui)} hoverSrc={type !== 'checkbox' ? hoverSrc : ''} style={imgStyle } />} */}
      {!!hoverSrc && type === 'checkbox' && checked && (
        <CustomImage src={assetSetter(hoverSrc, fileType.ui)} hoverSrc={type !== 'checkbox' ? hoverSrc : ''} style={imgStyle } />
      )}
      {!!menu.content && <CustomText text={menu.content} defaultClass={defaultTextClass} style={textStyle} />}
    </CustomContainer>
  );
};

export const Label = ({
  item,
  defaultClass,
  defaultTextClass,
  key,
  defaultHoverClass,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  item: ContainerItem;
  defaultClass?: string;
  defaultTextClass?: string;
  defaultHoverClass?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  key?: string;
}) => {
  if (item.args.hide) return null;
  const style = parseStyleArg(item.args.style);
  const textStyle = parseStyleArg(item.args.contentStyle);
  const textHoverStyle = parseStyleArg(item.args.contentHoverStyle);
  const imgStyle = parseStyleArg(item.args.backgroundStyle);
  const imgHoverStyle = parseStyleArg(item.args.backgroundHoverStyle);
  const src = item.args.style?.image || '';
  const hoverSrc = item.args.hoverStyle?.image || src;
  const menu = item as ButtonItem;
  if (style.width && !imgStyle.width && !imgStyle.height) imgStyle.width = style.width;
  if (style.height && !imgStyle.height && !imgStyle.width) imgStyle.height = style.height;
  if (!style.position) style.position = 'relative';

  if (textStyle.left === undefined && textStyle.top === undefined) {
    textStyle.left = '50%';
    textStyle.top = '50%';
    if (textStyle.transform) {
      textStyle.transform += ' translate(-50%, -50%)';
    } else {
      textStyle.transform = 'translate(-50%, -50%)';
    }
  }

  return (
    <CustomContainer
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      defaultClass={defaultClass}
      defaultHoverClass={defaultHoverClass}
      style={style}
      key={key}
    >
      <CustomImage src={src} hoverSrc={hoverSrc} style={imgStyle} hoverStyle={imgHoverStyle} />
      <CustomText text={menu.content} defaultClass={defaultTextClass} style={textStyle} hoverStyle={textHoverStyle} />
    </CustomContainer>
  );
};

export interface ISlider {
  uniqueID: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  initValue: number;
}

export const OptionSliderCustome = ({
  item,
  defaultClass,
  uniqueID,
  initValue,
  onChange,
}: {
  defaultClass?: string;
  item: SliderContainerItem;
  key?: string;
} & ISlider) => {
  const { playSeEnter } = useSoundEffect();
  useEffect(() => {
    setTimeout(() => {
      const input = document.getElementById(uniqueID);
      if (input !== null) input.setAttribute('value', (initValue || 0).toString());
      calcSlideBg();
    }, 1);
  }, []);

  useEffect(() => {
    calcSlideBg();
  }, [initValue]);

  useEffect(() => {
    const thumbStyle = parseStyleArg(item.args.sliderThumbStyle);
    const thumStyleString = cssPropertiesToString(thumbStyle);

    if (!thumStyleString) return;

    replaceOrAddRule(`#${uniqueID}::-webkit-slider-thumb`, `#${uniqueID}::-webkit-slider-thumb { ${thumStyleString} }`);

    replaceOrAddRule(`#${uniqueID}::-moz-range-thumb`, `#${uniqueID}::-moz-range-thumb { ${thumStyleString} }`);
    replaceOrAddRule(`#${uniqueID}::-ms-thumb`, `#${uniqueID}::-ms-thumb { ${thumStyleString} }`);
  }, [item.args.sliderThumbStyle, uniqueID]);

  function calcSlideBg() {
    const inputBg = document.getElementById(`${uniqueID}-bg`);
    if (inputBg !== null) {
      inputBg.style.width = ((Number(initValue.toString()) / 100) * (item.args.style?.width || 342)) / 0.5 + 'px';
    }
  }

  const style = parseStyleArg(item.args.style);
  const barStyle = parseStyleArg(item.args.sliderStyle);
  const barBgStyle = parseStyleArg(item.args.sliderBgStyle);
  const barSrc = item.args.sliderStyle?.image || BarSlider;
  const barBgSrc = item.args.sliderBgStyle?.image || BarBg;

  return (
    <CustomContainer style={style} defaultClass={`Option_WebGAL_slider ${defaultClass}`}>
      <input
        className="Rang_input"
        id={uniqueID}
        type="range"
        onChange={onChange}
        onFocus={playSeEnter}
        onMouseEnter={playSeEnter}
      />
      <div className="Slider_group">
        <CustomImage src={barSrc} style={barStyle} defaultClass="Slider_bg" nId={`${uniqueID}-bg`} />
        <CustomImage src={barBgSrc} style={barBgStyle} defaultClass="Slider_bg_under" />
      </div>
    </CustomContainer>
  );
};

function replaceOrAddRule(selector: string, ruleText: string) {
  const styleSheet = document.styleSheets[0];

  // 检查 ruleText 是否为空
  if (!ruleText || ruleText.includes('{}')) {
    console.warn(`跳过插入空规则: ${ruleText}`);
    return;
  }

  // 遍历找到匹配的选择器并替换其规则
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i] as CSSStyleRule;
    if (rule.selectorText === selector) {
      styleSheet.deleteRule(i);
      styleSheet.insertRule(ruleText, i);
      return;
    }
  }
  // 如果找不到，则添加新规则
  styleSheet.insertRule(ruleText, styleSheet.cssRules.length);
}

function cssPropertiesToString(styles: CSSProperties): string {
  // Helper function to convert camelCase to kebab-case
  const toKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  return Object.entries(styles)
    .map(([key, value]) => {
      // Convert the camelCase property name to kebab-case
      const propertyName = toKebabCase(key);
      let cssValue = value;

      // Add unit 'px' to numbers for certain properties if unit is not specified
      if (
        typeof value === 'number' &&
        propertyName !== 'z-index' && // 'z-index' should not have 'px'
        propertyName !== 'opacity' // 'opacity' should not have 'px'
      ) {
        cssValue = `${value}px`;
      }

      return `${propertyName}: ${cssValue};`;
    })
    .join(' ');
}
