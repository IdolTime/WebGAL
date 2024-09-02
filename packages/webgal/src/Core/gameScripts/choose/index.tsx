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
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { buyChapter, getIsBuy } from '@/services/store';
import { parseStyleArg } from '@/Core/parser/utils';
import { sleep } from '@/Core/util/sleep';

class ChooseOption {
  /**
   * 格式：
   * (showConditionVar>1)[enableConditionVar>2]->${x=1,y=1,scale=1,image=./assets/baidu.png,fontSize:24,fontColor:#fff}text:jump
   */
  public static parse(script: string, loadingRef: { current: Record<string, boolean> }): ChooseOption {
    const parts = script.split('->');
    const conditonPart = parts.length > 1 ? parts[0] : null;
    const mainPart = parts.length > 1 ? parts[1] : parts[0];
    const mainPartNodes = mainPart.split(':');

    const text = mainPartNodes[0].replace(/[\$\#]{[^{}]*}/, '');
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

    const payInfoMatch = /\#\{(.*?)\}/.exec(mainPart);
    if (payInfoMatch && webgalStore.getState().storeData.isEditorPreviewMode === false) {
      const payInfoStr = payInfoMatch[1];
      const payInfoProps = payInfoStr.split(',');
      let productId = 0;
      let amount = 0;

      payInfoProps.forEach((prop) => {
        const [key, value] = prop.split('=');
        if (key === 'productId') {
          productId = isNaN(Number(value.trim())) ? 0 : Number(value.trim());
        } else if (key === 'amount') {
          amount = isNaN(Number(value.trim())) ? 0 : Number(value.trim());
        }
      });

      const item = webgalStore
        .getState()
        .storeData.paymentConfigurationList.find((item) => item.product_id === productId);

      if (productId > 0 && amount > 0) {
        option.shouldPay = true;
        option.productId = productId;
        option.amount = amount;
        getIsBuy(productId).then((res) => {
          loadingRef.current[productId] = true;
        });
      }

      if (item?.is_buy === true) {
        option.hasBought = true;
      }
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
  public shouldPay?: boolean;
  public amount?: number;
  public productId?: number;
  public hasBought?: boolean;
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
  const loadingRef: { current: Record<string, boolean> } = { current: {} };
  const chooseOptions = chooseOptionScripts.map((e) => ChooseOption.parse(e, loadingRef));
  const fontFamily = webgalStore.getState().userData.optionData.textboxFont;
  const font = fontFamily === textFont.song ? '"思源宋体", serif' : '"WebgalUI", serif';
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  let isJumpRef = { current: false };
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
        const onClick = () => {
          // if (!enable || timer.current) {
          //   return;
          // }
          if (!enable && !isJumpRef.current) {
            return;
          }
          playSeClick();
          const continueCallback = () => {
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
            isJumpRef.current = false;
            WebGAL.gameplay.performController.unmountPerform('choose');
          };

          if (e.shouldPay) {
            const confirmCallback = () => {
              // @ts-ignore
              window.pubsub.publish('loading', { loading: true });
              buyChapter(e.productId ?? 0)
                .then(async (res) => {
                  // @ts-ignore
                  window.pubsub.publish('loading', { loading: false });

                  await sleep(2000);

                  if (res.code === 0) {
                    // @ts-ignore
                    window.pubsub.publish('toaster', { show: true, text: '购买成功' });
                    continueCallback();
                  } else if (res.code === 10014) {
                    // @ts-ignore
                    window.pubsub.publish('toaster', { show: true, text: '余额不足，请充值' });
                    // @ts-ignore
                    window.pubsub.publish('rechargeModal', {});
                  } else {
                    // @ts-ignore
                    window.pubsub.publish('toaster', { show: true, text: res.message });
                  }
                })
                .catch(() => {
                  // @ts-ignore
                  window.pubsub.publish('loading', { loading: false });
                });
            };
            let hasBought = false;

            const item = webgalStore
              .getState()
              .storeData.paymentConfigurationList.find((i) => i.product_id === e.productId);

            if (item) {
              hasBought = item.is_buy;
            }

            const showDialog = () => {
              showGlogalDialog({
                title: `您已进入付费选项`,
                content: `需要花费${e.amount}`,
                suffixContent: '解锁该选项吗？',
                leftText: '否',
                rightText: '是',
                type: 'pay',
                leftFunc: () => {},
                rightFunc: confirmCallback,
              });
            };

            if (hasBought) {
              if (loadingRef.current[e.productId || '']) {
                continueCallback();
              } else {
                getIsBuy(e.productId ?? 0).then((res) => {
                  if (res.code === 0) {
                    loadingRef.current[e.productId || ''] = true;
                    if (res.data.is_buy) {
                      continueCallback();
                    } else {
                      showDialog();
                    }
                  }
                });
              }
              return;
            }

            if (loadingRef.current[e.productId || ''] && !hasBought) {
              showDialog();
            } else {
              getIsBuy(e.productId ?? 0).then((res) => {
                if (res.code === 0) {
                  loadingRef.current[e.productId || ''] = true;
                  if (res.data.is_buy) {
                    continueCallback();
                  } else {
                    showDialog();
                  }
                }
              });
            }
            return;
          } else {
            continueCallback();
          }
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
              isJumpRef.current = !enable;
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
              <span>
                {e.text}
                {!e.hasBought && e.shouldPay && (
                  <span style={{ marginLeft: 8, fontSize: '0.7em' }}>(需要{e.amount}星石解锁)</span>
                )}
              </span>
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
            {!e.hasBought && e.shouldPay && (
              <span style={{ marginLeft: 8, fontSize: '0.7em' }}>(需要{e.amount}星光解锁)</span>
            )}
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
