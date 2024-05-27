import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React, { useRef } from 'react';
import styles from './choose.module.scss';
import { webgalStore } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import ProgressBarBackground from '@/assets/imgs/progress-bar-bg.png';
import ProgressBar from '@/assets/imgs/progress-bar.png';

class ChooseOption {
  /**
   * 格式：
   * (showConditionVar>1)[enableConditionVar>2]->${x=1,y=1,scale=1,image=./assets/baidu.png,fontSize:24,fontColor:#fff}text:jump
   */
  public static parse(script: string): ChooseOption {
    const parts = script.split('->');
    const conditonPart = parts.length > 1 ? parts[0] : null;
    const mainPart = parts.length > 1 ? parts[1] : parts[0];
    const mainPartNodes = mainPart.split(':');

    const text = mainPartNodes[0].replace(/\${[^{}]*}/, '');
    const option = new ChooseOption(text, mainPartNodes[1]);

    // Extract style information
    const styleRegex = /\$\{(.*?)\}/;
    const styleMatch = mainPart.match(styleRegex);
    if (styleMatch) {
      const styleStr = styleMatch[1];
      const styleProps = styleStr.split(',');
      const style: any = {}; // Change to specific type if possible

      // Parse each style property
      styleProps.forEach((prop) => {
        const [key, value] = prop.split('=');
        if (key && value) {
          style[key.trim()] = isNaN(Number(value.trim())) ? value.trim() : Number(value.trim());
        }
      });

      option.style = style;
    }

    if (conditonPart !== null) {
      const showConditionPart = conditonPart.match(/\((.*)\)/);
      if (showConditionPart) {
        option.showCondition = showConditionPart[1];
      }
      const enableConditionPart = conditonPart.match(/\[(.*)\]/);
      if (enableConditionPart) {
        option.enableCondition = enableConditionPart[1];
      }
    }
    return option;
  }

  public text: string;
  public jump: string;
  public jumpToScene: boolean;
  public showCondition?: string;
  public enableCondition?: string;
  public style?: {
    x?: number;
    y?: number;
    scale?: number;
    image?: string;
    fontSize?: number;
    fontColor?: string;
    countdown?: number;
  };

  public constructor(text: string, jump: string) {
    this.text = text;
    this.jump = jump;
    this.jumpToScene = jump.match(/\./) !== null;
  }
}

/**
 * 显示选择枝
 * @param sentence
 */
export const choose = (sentence: ISentence, chooseCallback?: () => void): IPerform => {
  const chooseOptionScripts = sentence.content.split('|');
  const chooseOptions = chooseOptionScripts.map((e) => ChooseOption.parse(e));
  const fontFamily = webgalStore.getState().userData.optionData.textboxFont;
  const font = fontFamily === textFont.song ? '"思源宋体", serif' : '"WebgalUI", serif';
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  let timer = {
    current: null as ReturnType<typeof setTimeout> | null,
  };

  // 运行时计算JSX.Element[]
  const runtimeBuildList = (chooseListFull: ChooseOption[]) => {
    return chooseListFull
      .filter((e, i) => whenChecker(e.showCondition))
      .map((e, i) => {
        const enable = whenChecker(e.enableCondition);
        let className = enable ? styles.Choose_item : styles.Choose_item_disabled;
        const onClick = enable
          ? () => {
              playSeClick();
              chooseCallback?.();

              if (timer.current) {
                clearTimeout(timer.current);
                timer.current = null;
              }

              if (e.jumpToScene) {
                changeScene(e.jump, e.text);
              } else {
                jmp(e.jump);
              }
              WebGAL.gameplay.performController.unmountPerform('choose');
            }
          : () => {};
        const styleObj: Record<string, number | string> = {
          fontFamily: font,
        };
        console.log(33333, e);

        if (e.style) {
          if (typeof e.style.x === 'number') {
            styleObj.position = 'absolute';
            styleObj['left'] = e.style.x * 1.33333 + 'px';
            styleObj['transform'] = 'translateX(-50%)';
          }
          if (typeof e.style.y === 'number') {
            styleObj.position = 'absolute';
            styleObj['top'] = e.style.y * 1.33333 + 'px';
            if (styleObj['transform']) {
              styleObj['transform'] += ' translateY(-50%)';
            } else {
              styleObj['transform'] = 'translateY(-50%)';
            }
          }
          if (typeof e.style.scale === 'number') {
            if (styleObj['transform']) {
              styleObj['transform'] += ' scale(' + e.style.scale + ')';
            } else {
              styleObj['transform'] = 'scale(' + e.style.scale + ')';
            }
          }
          if (typeof e.style.fontSize === 'number') {
            styleObj['fontSize'] = e.style.fontSize + 'px';
          }
          if (typeof e.style.fontColor === 'string' && e.style.fontColor[0] === '#') {
            styleObj['color'] = e.style.fontColor;
          }
        }

        if (typeof e.style?.countdown === 'number') {
          className = styles.Choose_item_countdown;
          let time = e.style.countdown;
          let width = 1082;
          let unit = 1082 / ((time * 1000) / 16);

          const countdown = () => {
            if (time <= 0 && timer.current) {
              clearTimeout(timer as any);
              timer.current = null;
              onClick();
            } else {
              timer.current = setTimeout(() => {
                time -= 0.016;
                width -= unit;
                let rect = document.getElementById('rect');
                rect?.setAttribute('width', Math.max(0, width).toString());
                countdown();
              }, 16);
            }
          };

          countdown();

          return (
            <React.Fragment key={e.jump + i}>
              <div className={className} style={styleObj}>
                <img src={ProgressBarBackground} alt={e.text} style={{ width: '1082px', height: '106px' }} />
                <img src={ProgressBar} className={styles.Choose_item_progress_bar} />
              </div>
              <svg width="0" height="0">
                <defs>
                  <clipPath id="myClip">
                    <rect id="rect" width="1082" height="106" rx="53" ry="53" style={{ fill: '#fff' }} />
                  </clipPath>
                </defs>
              </svg>
            </React.Fragment>
          );
        }

        if (e.style?.image) {
          className = styles.Choose_item_image;
          const imgUrl = assetSetter(e.style.image, fileType.ui);
          const id = `img-option-${i}`;
          const img = new Image();
          img.src = imgUrl; // 将图片的URL赋值给Image对象的src属性

          img.onload = function () {
            let ele = document.getElementById(id);
            img.style.width = img.naturalWidth + 'px';
            img.style.height = img.naturalHeight + 'px';
            img.alt = e.text;

            if (ele) {
              ele.style.width = img.naturalWidth + 'px';
              ele.style.height = img.naturalHeight + 'px';
              setTimeout(() => {
                ele?.prepend(img);
                ele = null;
              }, 32);
            }
          };

          return (
            <div
              id={id}
              className={className}
              style={styleObj}
              key={e.jump + i}
              onClick={onClick}
              onMouseEnter={playSeEnter}
            >
              <span>{e.text}</span>
            </div>
          );
        }

        return (
          <div className={className} style={styleObj} key={e.jump + i} onClick={onClick} onMouseEnter={playSeEnter}>
            {e.text}
          </div>
        );
      });
  };
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <div className={styles.Choose_Main}>{runtimeBuildList(chooseOptions)}</div>,
    document.getElementById('chooseContainer'),
  );
  return {
    performName: 'choose',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    stopFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
