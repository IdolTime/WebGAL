import React, { ChangeEvent, CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ButtonItem,
  ContainerItem,
  IndicatorContainerItem,
  SliderContainerItem,
  Style,
  UIItemConfig,
} from '@/Core/UIConfigTypes';
import { parseStyleArg } from '@/Core/parser/utils';
import useSoundEffect from '@/hooks/useSoundEffect';
import BarBg from '@/assets/imgs/bar-bg.png';
import BarSlider from '@/assets/imgs/bar-checked.png';
import { debounce } from 'lodash';
import { SCREEN_CONSTANTS, updateScreenSize } from '@/Core/util/constants';

import './slider.scss';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

export const CustomText = ({
  text,
  defaultClass,
  defaultHoverClass,
  defaultActiveClass,
  style,
  hoverStyle,
  activeStyle,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onMouseOut,
  onClick,
  key,
  isACtiveStatus,
  isHoverStatus
}: {
  text: string;
  defaultClass?: string;
  defaultHoverClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  defaultActiveClass?: string;
  activeStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseOut?: () => void;
  onClick?: () => void;
  key?: string;
  isACtiveStatus?: boolean;
  isHoverStatus?: boolean;
}) => {
  const id = `customText-${key}-${text}`;
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
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

  if (isHoverStatus) {
    className = `${defaultClass} ${defaultHoverClass}`;
    _style = { ...style, ...hoverStyle };
  }

  if (isACtiveStatus) {
    className = `${defaultClass} ${defaultActiveClass}`;
    _style = { ...style, ...activeStyle };
  } 

  const btnTextElement = document.getElementById(`${id}-text`);
  if (btnTextElement && text) {
    btnTextElement.innerText = text?.replace(/\\n/g, '\n') ?? text;
  }

  const _mousedown = () => {
    if (active) setActive(true);
    onMouseDown?.();
  }

  const _mouseup = () => {
    setActive(false);
    onMouseUp?.();
  }

  return (
    <span
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onMouseDown={_mousedown}
      onMouseUp={_mouseup}
      onMouseOut={onMouseOut}
      onClick={onClick}
      style={_style}
      id={`${id}-text`}
    >
      {text}
    </span>
  );
};

export const CustomImage = ({
  src,
  hoverSrc,
  activeSrc,
  defaultClass,
  defaultHoverClass,
  defaultActiveClass,
  style,
  hoverStyle,
  activeStyle,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onClick,
  nId,
  draggable,
  isHoverStatus,
  isACtiveStatus
}: {
  src: string;
  hoverSrc?: string;
  activeSrc?: string;
  defaultClass?: string;
  defaultHoverClass?: string;
  defaultActiveClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  activeStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onClick?: () => void;
  nId?: string;
  draggable?: boolean;
  isHoverStatus?: boolean;
  isACtiveStatus?: boolean;
}) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [_, _forceRender] = useState(0);
  const forceRender = () => _forceRender((i) => i + 1);
  const imgLayout = useRef<{ width?: number; height?: number }>({ width: undefined, height: undefined });
  let className = defaultClass;
  let _style = style || {};

  const _onMouseEnter = () => {
    if (hoverSrc || hoverStyle) {
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

  const _onMouseDown = () => {
    setActive(true);
    setHover(false);
    onMouseDown && onMouseDown?.();
  }
  
  const _onMouseUp = () => {
    setActive(false);
    onMouseUp && onMouseUp?.()
  }

  if (isHoverStatus) {
    className = `${defaultClass || ''} ${defaultHoverClass || ''}`;
    _style = { ...style, ...hoverStyle };
  }

  if (isACtiveStatus) {
    className = `${defaultClass || ''} ${defaultActiveClass || ''}`;
    _style = { ...style, ...activeStyle };
  }

  if (_style.width === undefined) {
    _style.width = imgLayout.current.width;
    _style.height = imgLayout.current.height;
  }

  return (
    <img
      id={nId}
      src={isHoverStatus && hoverSrc || isACtiveStatus && activeSrc || src}
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onMouseDown={_onMouseDown}
      onMouseUp={_onMouseUp}
      draggable={draggable}
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
  defaultActiveClass,
  style,
  hoverStyle,
  activeStyle,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onMouseOut,
  onClick,
  id,
  isACtiveStatus
}: {
  item?: ContainerItem;
  children: ReactNode;
  defaultClass?: string;
  defaultHoverClass?: string;
  defaultActiveClass?: string;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  activeStyle?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseOut?: () => void;
  onClick?: (e: any) => void;
  id?: string;
  isACtiveStatus?: boolean;
}) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  let className = defaultClass;
  let _style = style;
  let _hoverStyle = hoverStyle;
  let _activeStyle = activeStyle;

  if (item) {
    if (item.args.hide) return null;
    if (!_style) _style = parseStyleArg(item.args.style);
    if (!_hoverStyle) _hoverStyle = parseStyleArg(item.args.hoverStyle);
    if (!_activeStyle) _activeStyle = parseStyleArg(item.args.activeStyle);
  }

  const _onMouseEnter = () => {
    if (_hoverStyle) {
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
    _style = {
      ...style,
      ...hoverStyle,
    };
  }

  if (active) {
    className = `${defaultClass} ${defaultActiveClass}`;
    _style = {
      ...style,
      ...activeStyle,
    };
  }

  const _mousedown = () => {
    if (_activeStyle) {
      setActive(true);
    }
    onMouseDown?.();
  }

  const _mouseup = () => {
    setActive(false);
    onMouseUp?.();
  }

  const _mouseOut = () => {
    setActive(false);
    onMouseOut?.()
  }

  return (
    <div
      className={className}
      onMouseEnter={_onMouseEnter}
      onMouseLeave={_onMouseLeave}
      onMouseDown={_mousedown}
      onMouseUp={_mouseup}
      onMouseOut={_mouseOut}
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

  if (!item.args.style?.image) return <div className={defaultClass} style={style} draggable="false" />;

  return <CustomImage key={key} defaultClass={defaultClass} src={src} style={style} />;
};

export const Button = ({
  item,
  defaultClass,
  defaultTextClass,
  key,
  defaultHoverClass,
  defaultActiveClass,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
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
  defaultActiveClass?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
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
  const [clicked, setClicked] = useState(false);
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [isTextMouseOut, setIsTextMouseOut] = useState(false);
  const parsedStyle = parseStyleArg(item.args.style);
  const hoverStyle = parseStyleArg(item.args.hoverStyle);
  const activeStyle = parseStyleArg(item.args.activeStyle);
  const { playSeClick } = useSoundEffect();
  const src = item.args.style?.image || '';
  const customClickSound = item.args?.btnSound?.clickSound
    ? assetSetter(item.args.btnSound.clickSound, fileType.bgm)
    : '';
  const hoverSrc = item.args.hoverStyle?.image || src;
  const activeSrc = item.args.activeStyle?.image || '';
  const menu = item as ButtonItem;
  const imgStyle: CSSProperties = {};
  const clickTimerRef = useRef<any>();
  const clickedTimeRef = useRef(0);
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
  // if (src) style.backgroundImage = 'none';
  if (src) {
    // _style.backgroundImage = `url(${assetSetter(src, fileType.ui)})`;
    _style.backgroundSize = '100% 100%';
    _style.backgroundRepeat = 'no-repeat';
  }

  const clickCallback = () => {
    if (type === 'checkbox') {
      playSeClick(customClickSound);
      onChecked(!checked);
    }
    if (onClick) {
      playSeClick(customClickSound);
      onClick();
    }
  };

  const interactable = typeof onClick === 'function' && typeof onMouseEnter === 'function';

  return (
    <CustomContainer
      onMouseEnter={() => {
        setHover(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => {
        setHover(false);
        onMouseLeave?.();
      }}
      onClick={clickCallback}
      onMouseDown={() => {
        setActive(true);
        setHover(false);
        onMouseDown?.();
      }}
      onMouseUp={() => {
        setActive(false);
        setHover(false);
        setIsTextMouseOut(false);
        onMouseUp?.();
      }}
      onMouseOut={() => {
        if (isTextMouseOut) {
          setTimeout(() => {
            setActive(false);
            setIsTextMouseOut(false);
          }, 2000)
        } else {
          setActive(false);
          setIsTextMouseOut(false);
        }
      }}
      // onMouseDown={
      //   interactable
      //     ? () => {
      //         clearTimeout(clickTimerRef.current);
      //         setClicked(true);
      //         clickedTimeRef.current = Date.now();
      //       }
      //     : undefined
      // }
      // onMouseUp={
      //   interactable
      //     ? () => {
      //         const duration = Date.now() - clickedTimeRef.current;

      //         setTimeout(
      //           () => {
      //             setClicked(false);
      //             setTimeout(() => {
      //               clickCallback();
      //             }, 320);
      //           },
      //           duration - 350 > 0 ? 0 : 350 - duration,
      //         );
      //       }
      //     : undefined
      // }
      defaultClass={`${defaultClass} ${clicked ? 'btn-clicked' : ''}`}
      defaultHoverClass={defaultHoverClass}
      defaultActiveClass={defaultActiveClass}
      style={_style}
      hoverStyle={hoverStyle}
      activeStyle={activeStyle}
      key={key}
      isACtiveStatus={active}
    >
      {!!src && (
        <CustomImage
          nId={key}
          src={assetSetter(checked ? hoverSrc : src, fileType.ui)}
          hoverSrc={hoverSrc ? assetSetter(hoverSrc, fileType.ui) : ''}
          activeSrc={activeSrc ? assetSetter(activeSrc, fileType.ui) : ''}
          style={imgStyle}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isHoverStatus={hover}
          isACtiveStatus={active}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
      )}
      {menu.content ? (
        <CustomText 
          key={key} 
          text={menu.content} 
          defaultClass={defaultTextClass} 
          activeStyle={activeStyle}
          style={textStyle} 
          isACtiveStatus={active}
          isHoverStatus={hover}
          onMouseDown={() => {
            if (!!src) setIsTextMouseOut(true);
          }}
        />
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
  isUpdate,
}: {
  defaultClass?: string;
  item: SliderContainerItem;
  key?: string;
  min?: number;
  max?: number;
  className?: string;
  isUpdate?: boolean;
} & ISlider) => {
  if (item.args.hide) return null;
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
  }, [initValue, isUpdate]);

  useEffect(() => {
    const thumbStyle = parseStyleArg(item.args.sliderThumb);
    const thumStyleString = cssPropertiesToString(thumbStyle);

    if (!thumStyleString) return;

    replaceOrAddRule(`#${uniqueID}::-webkit-slider-thumb`, `#${uniqueID}::-webkit-slider-thumb { ${thumStyleString} }`);

    replaceOrAddRule(`#${uniqueID}::-moz-range-thumb`, `#${uniqueID}::-moz-range-thumb { ${thumStyleString} }`);
    replaceOrAddRule(`#${uniqueID}::-ms-thumb`, `#${uniqueID}::-ms-thumb { ${thumStyleString} }`);
  }, [item.args.sliderThumb, uniqueID]);

  function calcSlideBg() {
    const inputBg = document.getElementById(`${uniqueID}-bg`);
    if (inputBg !== null) {
      const screenSizeWidth = updateScreenSize().width;
      const num = screenSizeWidth === 2560 ? 2 : 3;
      const scale = screenSizeWidth === 2560 ? 0.5 : 0.3333;
      if (uniqueID === 'light') {
        const normalizedValue = (Number(initValue) - 50) / 50; // 将值从 50-100 映射到 0-1 范围
        const progressBarWidth = normalizedValue * ((item.args.style?.width || 342) * num) + 'px'; // 将 0-1 映射到 0-684px 范围
        inputBg.style.width = progressBarWidth;
      } else {
        inputBg.style.width = ((Number(initValue.toString()) / 100) * (item.args.style?.width || 342)) / scale + 'px';
      }
    }
  }

  const bgNone = {
    background: 'none',
  };

  const style = parseStyleArg(item.args.style);

  const barStyle = item.args?.slider?.image
    ? { ...parseStyleArg(item.args?.slider), ...bgNone }
    : parseStyleArg(item.args?.slider);

  const barBgStyle = item.args?.sliderBg?.image
    ? { ...parseStyleArg(item.args?.sliderBg), ...bgNone }
    : parseStyleArg(item.args?.sliderBg);

  const barSrc = item.args?.slider?.image ? assetSetter(item.args.slider.image, fileType.ui) : BarSlider;

  const barBgSrc = item.args?.sliderBg?.image ? assetSetter(item.args.sliderBg.image, fileType.ui) : BarBg;

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
        <CustomImage src={barSrc} style={barStyle} defaultClass="Slider_bg" nId={`${uniqueID}-bg`} draggable={false} />
        <CustomImage src={barBgSrc} style={barBgStyle} defaultClass="Slider_bg_under" draggable={false} />
      </div>
    </CustomContainer>
  );
};

export const Indicator = ({
  item,
  defaultClass,
  key,
  onMouseEnter,
  onMouseLeave,
  activeIndex,
  pageLength = 1,
  indicatorDefaultClass,
  activeIndecatorClass,
  onClickIndicator = () => {},
  onClickPrev = () => {},
  onClickNext = () => {},
  nextIconDefaultClass,
  prevIconDefaultClass,
  isExtraIndicator,
  isShowNumber
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
  isExtraIndicator?: boolean;
  isShowNumber?: boolean;
}) => {
  if (item.args.hide) return null;
  const style = parseStyleArg(item.args.style);
  const [hover, setHover] = useState<string>('');
  const [active, setActive] = useState<string>('');

  const contentImg = isExtraIndicator ? item.args.style?.image :item.args.indicatorStyle?.image

  const indicatorList = useMemo(
    () =>
      Array.from({ length: pageLength }).map(
        (_, index) =>
          ({
            content: contentImg ? '' : (index + 1).toString(),
            key: (index + 1)?.toString() as any,
            args: {
              hide: false,
              style: isExtraIndicator ? item.args?.style || {} : item.args.indicatorStyle || {},
              hoverStyle: item.args.indicatorHoverStyle,
            },
          } satisfies ButtonItem),
      ),
    [pageLength],
  );

  const prevIconSrc = item.args.indicatorLeftStyle?.image || '';
  const nextIconSrc = item.args.indicatorRightStyle?.image || '';
  
  const prevIconHoverSrc = item.args?.indicatorLeftHoverStyle?.image;
  const nextIconHoverSrc = item.args?.indicatorRightHoverStyle?.image;

  const prevIconActive = item.args?.indicatorLeftActiveStyle?.image;
  const nextIconActive = item.args?.indicatorRightActiveStyle?.image;

  const indicatorStyle: CSSProperties = {};

  if (item.args.indicatorStyle?.image) {
    indicatorStyle.border = 0;
  }

  return (
    <CustomContainer defaultClass={defaultClass} style={style} key={key}>
      {prevIconSrc ? (
        <CustomImage
          nId={key + 'prevIcon'}
          src={assetSetter(prevIconHoverSrc && hover === 'prevIconHover' ? prevIconHoverSrc : prevIconSrc, fileType.ui)}
          activeSrc={prevIconActive ? assetSetter(prevIconActive, fileType.ui) : ''}
          defaultClass={prevIconDefaultClass}
          onClick={onClickPrev}
          isACtiveStatus={active === 'prevIconActive'}
          onMouseEnter={() => {
            if (prevIconHoverSrc) setHover('prevIconHover');
            onMouseEnter?.();
          }}
          onMouseLeave={() => {
            setHover('');
            onMouseLeave?.();
          }}
          onMouseDown={() => {
            setActive('prevIconActive');
          }}
          onMouseUp={() => {
            setActive('');
          }}
        />
      ) : (
        <div className={prevIconDefaultClass} onMouseEnter={onMouseEnter} onClick={onClickPrev} />
      )}
      {indicatorList.map((x, index) => (
        <Button
          key={index.toString()}
          item={x}
          defaultClass={`${indicatorDefaultClass} ${index+1 === activeIndex ? activeIndecatorClass : ''}`}
          checked={Number(x.key) === activeIndex}
          type="checkbox"
          onChecked={() => {
            onClickIndicator(Number(x.key));
          }}
        />
      ))}
      {nextIconSrc ? (
        <CustomImage
          nId={key + 'nextIcon'}
          src={assetSetter(nextIconHoverSrc && hover === 'nextIconHover' ? nextIconHoverSrc : nextIconSrc, fileType.ui)}
          activeSrc={nextIconActive ? assetSetter(nextIconActive, fileType.ui) : ''}
          defaultClass={nextIconDefaultClass}
          isACtiveStatus={active === 'nextIconActive'}
          onClick={onClickNext}
          onMouseEnter={() => {
            if (nextIconHoverSrc) setHover('nextIconHover');
            onMouseEnter?.();
          }}
          onMouseLeave={() => {
            setHover('');
            onMouseLeave?.();
          }}
          onMouseDown={() => {
            setActive('nextIconActive');
          }}
          onMouseUp={() => {
            setActive('');
          }}
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
