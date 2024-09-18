import { px2 } from '@/Core/parser/utils';
import React, { useState } from 'react';

export const SourceImg = (
  props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>,
) => {
  const [layout, setLayout] = useState<{ width: number; height: number }>();

  return (
    <img
      {...props}
      style={layout ? { ...props.style, width: layout.width, height: layout.height } : props.style}
      onLoad={(e) => {
        if (props.style?.width || props.style?.height) return;
        setLayout({ width: px2(e.currentTarget.naturalWidth), height: px2(e.currentTarget.naturalHeight) });
      }}
    />
  );
};
