import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React, { CSSProperties, useRef } from 'react';
import styles from './choose.module.scss';
import { webgalStore } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import ProgressBarBackground from '@/assets/imgs/progress-bar-bg.png';
import ProgressBar from '@/assets/imgs/progress-bar.png';
import { parseStyleArg } from '@/Core/parser/utils';

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
  let isJump = false;
  let timer = {
    current: null as ReturnType<typeof setTimeout> | null,
  };

  // 运行时计算JSX.Element[]
  const runtimeBuildList = (chooseListFull: ChooseOption[]) => {
    return chooseListFull
      .filter((e, i) => whenChecker(e.showCondition))
      .map((e, i) => {
        const enable = whenChecker(e.enableCondition);
        let className = enable ? `${styles.Choose_item} interactive` : styles.Choose_item_disabled;
        const onClick = () => {
          // if (!enable || timer.current) {
          //   return;
          // }
          if (!enable && !isJump) {
            return;
          }
          playSeClick();
          chooseCallback?.();
          if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
          }

          if (e.jumpToScene) {
            const sceneName = e.jump.split('./game/scene/')[1];
            changeScene(e.jump, sceneName);
          } else {
            jmp(e.jump);
          }
          WebGAL.gameplay.performController.unmountPerform('choose');
          isJump = false;
        };
        // : () => {};
        let styleObj: CSSProperties = {
          fontFamily: font,
        };

        if (e.style) {
          styleObj = parseStyleArg(e.style);
        }

        if (typeof e.style?.countdown === 'number') {
          className = enable ? styles.Choose_item_countdown : styles.Choose_item_countdown_disabled;
          let time = e.style.countdown;
          let width = 1082;
          let unit = 1082 / ((time * 1000) / 16);

          const countdown = () => {
            if (time <= 0 && timer.current) {
              clearTimeout(timer as any);
              timer.current = null;
              isJump = !enable;
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
              <div className={className} style={styleObj} onClick={onClick}>
                <img src={ProgressBarBackground} alt={e.text} style={{ width: '1082px', height: '106px' }} />
                <img src={ProgressBar} className={styles.Choose_item_progress_bar} />
              </div>
              <svg width="0" height="0">
                <defs>
                  <clipPath id="myClip">
                    <rect id="rect" width="1082" height="106" rx="53" ry="53" style={{ fill: '#ffffff' }} />
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
            img.style.position = 'absolute';
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
              onMouseEnter={enable ? playSeEnter : undefined}
            >
              <span>{e.text}</span>
            </div>
          );
        }

        return (
          <div
            className={className}
            style={styleObj}
            key={e.jump + i}
            onClick={onClick}
            onMouseEnter={enable ? playSeEnter : undefined}
          >
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
    duration: 1000 * 60 * 60 * 24 * 3650,
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
