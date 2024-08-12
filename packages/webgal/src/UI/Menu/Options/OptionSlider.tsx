import './slider.scss';
import { ISlider } from '@/UI/Menu/Options/OptionInterface';
import { useEffect } from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';

export const OptionSlider = (props: ISlider) => {
  const { playSeEnter } = useSoundEffect();
  useEffect(() => {
    setTimeout(() => {
      const input = document.getElementById(props.uniqueID);
      if (input !== null) input.setAttribute('value', (props.initValue || 0).toString());
      calcSlideBg();
    }, 1);
  }, []);

  useEffect(() => {
    calcSlideBg();
  }, [props.initValue]);

  function calcSlideBg() {
    const inputBg = document.getElementById(`${props.uniqueID}-bg`);

    if (inputBg !== null && props.uniqueID === 'light') {
      const normalizedValue = (Number(props.initValue) - 50) / 50; // 将值从 50-100 映射到 0-1 范围
      const progressBarWidth = normalizedValue * 684 + 'px'; // 将 0-1 映射到 0-684px 范围
      inputBg.style.width = progressBarWidth;
    } else {
      if (inputBg !== null) {
        inputBg.style.width = ((Number(props.initValue?.toString()) / 100) * 342) / 0.5 + 'px';
      }
    }
  }
  return (
    <div className="Option_WebGAL_slider">
      <input
        className="Rang_input"
        id={props.uniqueID}
        type="range"
        min={props?.min ?? 0}
        max={props?.max ?? 100}
        onChange={props.onChange}
        onFocus={playSeEnter}
        onMouseEnter={playSeEnter}
      />
      <div className="Slider_group">
        <div className="Slider_bg" id={`${props.uniqueID}-bg`} />
        <div className="Slider_bg_under" />
      </div>
    </div>
  );
};
