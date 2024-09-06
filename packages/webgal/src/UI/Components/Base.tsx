import {
  ButtonItem,
  ContainerItem,
  IndicatorContainerItem,
  SliderContainerItem,
  Style,
  UIItemConfig,
} from '@/Core/UIConfigTypes';
import React, { ChangeEvent, CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { parseStyleArg } from '@/Core/parser/utils';
import useSoundEffect from '@/hooks/useSoundEffect';
import BarBg from '@/assets/imgs/bar-bg.png';
import BarSlider from '@/assets/imgs/bar-checked.png';
import { debounce } from 'lodash';

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

  const _onMouseEnter = debounce(() => {
    if (hoverStyle) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  }, 100);

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

  const _onMouseEnter = debounce(() => {
    if (hoverSrc || hoverStyle) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  }, 100);

  const _onMouseLeave = () => {
    setHover(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  if (hover) {
    className = `${defaultClass || ''} ${defaultHoverClass || ''}`;
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
  item,
  children,
  defaultClass,
  defaultHoverClass,
  style,
  hoverStyle,
  onMouseEnter,
  onMouseLeave,
  onClick,
  id,
}: {
  item?: ContainerItem;
  children: ReactNode;
  defaultClass?: string;
  defaultHoverClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e: any) => void;
  id?: string;
}) => {
  const [hover, setHover] = useState(false);
  let className = defaultClass;
  let _style = style;
  let _hoverStyle = hoverStyle;

  if (item) {
    if (item.args.hide) return null;
    if (!_style) _style = parseStyleArg(item.args.style);
    if (!_hoverStyle) _hoverStyle = parseStyleArg(item.args.hoverStyle);
  }

  const _onMouseEnter = debounce(() => {
    if (_hoverStyle) {
      setHover(true);
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  }, 100);
  const _onMouseLeave = () => {
    setHover(false);
    if (onMouseLeave) {
      onMouseLeave();
    }
  };
  if (hover) {
    className = `${defaultClass || ''} ${defaultHoverClass || ''}`;
    _style = { ..._style, ..._hoverStyle };
  }

  return (
    <div
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onClick={onClick}
      style={_style}
      id={id}
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
  text = '',
  style,
  defaultText = '',
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
  text?: string;
  style?: CSSProperties;
  defaultText?: string;
}) => {
  if (item.args.hide) return null;
  const parsedStyle = parseStyleArg(item.args.style);
  const hoverStyle = parseStyleArg(item.args.hoverStyle);
  const { playSeClick } = useSoundEffect();
  const src = item.args.style?.image || '';
  const customClickSound = 
    item.args?.btnSound?.clickSound 
      ? assetSetter(item.args.btnSound.clickSound, fileType.bgm) 
      : '';
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
  const _style = { ...parsedStyle, ...style };
  if (_style.width) imgStyle.width = _style.width;
  if (_style.height) imgStyle.height = _style.height;
  // if (!style.position) style.position = 'absolute';
  if (src) _style.backgroundImage = 'none';
  // if (src) {
  //   _style.backgroundImage = `url(${assetSetter(src, fileType.ui)})`;
  //   _style.backgroundSize = '100% 100%';
  //   _style.backgroundRepeat = 'no-repeat';
  // }

  const clickCallback = (event: React.MouseEvent<HTMLDivElement>) => {
    if (type === 'checkbox') {
      onChecked(!checked);
    }
    if (onClick) {
      playSeClick(customClickSound);
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
      style={_style}
      hoverStyle={hoverStyle}
      key={key}
    >
      {!!src && (
        <CustomImage
          nId={key}
          src={assetSetter(checked ? hoverSrc : src, fileType.ui)}
          hoverSrc={hoverSrc ? assetSetter(hoverSrc, fileType.ui) : ''}
          style={imgStyle}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )}
      {menu.content ? (
        <CustomText text={menu.content} defaultClass={defaultTextClass} style={textStyle} />
      ) : (
        !src && defaultText
      )}
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
  min,
  max,
  className,
}: {
  defaultClass?: string;
  item: SliderContainerItem;
  key?: string;
  min?: number;
  max?: number;
  className?: string;
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
      if (uniqueID === 'light') {
        const normalizedValue = (Number(initValue) - 50) / 50; // 将值从 50-100 映射到 0-1 范围
        const progressBarWidth = normalizedValue * ((item.args.style?.width || 342) * 2) + 'px'; // 将 0-1 映射到 0-684px 范围
        inputBg.style.width = progressBarWidth;
      } else {
        inputBg.style.width = ((Number(initValue.toString()) / 100) * (item.args.style?.width || 342)) / 0.5 + 'px';
      }
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
        min={min || 0}
        max={max || 100}
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

export const Indicator = ({
  item,
  defaultClass,
  key,
  onMouseEnter,
  activeIndex,
  pageLength = 1,
  indicatorDefaultClass,
  activeIndecatorClass,
  onClickIndicator = () => {},
  onClickPrev = () => {},
  onClickNext = () => {},
  nextIconDefaultClass,
  prevIconDefaultClass,
}: {
  item: IndicatorContainerItem;
  defaultClass?: string;
  indicatorDefaultClass?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  key?: string;
  type?: 'button' | 'checkbox';
  checked?: boolean;
  onChecked?: (checked: boolean) => void;
  activeIndex: number;
  activeIndecatorClass?: string;
  pageLength: number;
  onClickIndicator?: (index: number) => void;
  onClickPrev?: () => void;
  onClickNext?: () => void;
  nextIconDefaultClass?: string;
  prevIconDefaultClass?: string;
}) => {
  if (item.args.hide) return null;
  const style = parseStyleArg(item.args.style);

  const indicatorList = useMemo(
    () =>
      Array.from({ length: pageLength }).map(
        (_, index) =>
          ({
            content: item.args.indicatorStyle?.image ? '' : (index + 1).toString(),
            key: '' as any,
            args: {
              hide: false,
              style: item.args.indicatorStyle || {},
              hoverStyle: item.args.indicatorHoverStyle,
            },
          } satisfies ButtonItem),
      ),
    [pageLength],
  );

  const prevIconSrc = item.args.indicatorLeftStyle?.image || '';
  const nextIconSrc = item.args.indicatorRightStyle?.image || '';
  const indicatorStyle: CSSProperties = {};

  if (item.args.indicatorStyle?.image) {
    indicatorStyle.border = 0;
  }

  return (
    <CustomContainer defaultClass={defaultClass} style={style} key={key}>
      {prevIconSrc ? (
        <CustomImage
          src={prevIconSrc}
          onMouseEnter={onMouseEnter}
          defaultClass={prevIconDefaultClass}
          onClick={onClickPrev}
        />
      ) : (
        <div className={prevIconDefaultClass} onMouseEnter={onMouseEnter} onClick={onClickPrev} />
      )}
      {indicatorList.map((x, index) => (
        <Button
          key={index.toString()}
          item={x}
          defaultClass={`${indicatorDefaultClass} ${index === activeIndex ? activeIndecatorClass : ''}`}
          checked={index === activeIndex}
          type="checkbox"
          onChecked={() => {
            onClickIndicator(index);
          }}
        />
      ))}
      {nextIconSrc ? (
        <CustomImage
          src={nextIconSrc}
          onMouseEnter={onMouseEnter}
          defaultClass={nextIconDefaultClass}
          onClick={onClickNext}
        />
      ) : (
        <div className={nextIconDefaultClass} onMouseEnter={onMouseEnter} onClick={onClickNext} />
      )}
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
