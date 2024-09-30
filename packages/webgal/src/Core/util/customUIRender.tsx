import {
  ButtonItem,
  ContainerItem,
  IndicatorContainerItem,
  SliderContainerItem,
  Style,
  UIItemConfig,
} from '../UIConfigTypes';
import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { assetSetter } from './gameAssetsAccess/assetSetter';
import { parseStyleArg } from '../parser/utils';

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

export const renderBgImage = ({ item, defaultClass, key }: { item: Item; defaultClass?: string; key?: string }) => {
  if (item.args.hide) return null;
  const style = parseStyleArg(item.args.style);
  return <CustomImage key={key} defaultClass={defaultClass} src={item.args.style?.image || ''} style={style} />;
};

export const renderButton = ({
  item,
  defaultClass,
  defaultTextClass,
  key,
  defaultHoverClass,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  item: ButtonItem;
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
  const hoverStyle = parseStyleArg(item.args.hoverStyle);
  const src = item.args.style?.image || '';
  const hoverSrc = item.args.hoverStyle?.image || src;
  const menu = item as ButtonItem;
  const imgStyle: CSSProperties = {};
  const textStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
  if (style.width) imgStyle.width = style.width;
  if (style.height) imgStyle.height = style.height;
  if (!style.position) style.position = 'relative';

  return (
    <CustomContainer
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      defaultClass={defaultClass}
      defaultHoverClass={defaultHoverClass}
      style={style}
      hoverStyle={hoverStyle}
      key={key}
    >
      <CustomImage src={src} hoverSrc={hoverSrc} style={imgStyle} />
      <CustomText text={menu.content} defaultClass={defaultTextClass} style={textStyle} />
    </CustomContainer>
  );
};

export const renderLabel = ({
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

export const renderSlider = ({
  item,
  defaultClass,
  defaultTextClass,
  key,
  defaultHoverClass,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  item: SliderContainerItem;
  defaultClass?: string;
  defaultTextClass?: string;
  defaultHoverClass?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
  key?: string;
}) => {
  if (item.args.hide) return null;
};
