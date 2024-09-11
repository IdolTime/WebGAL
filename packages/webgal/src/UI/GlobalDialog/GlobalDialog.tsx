import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import useSoundEffect, { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import React from 'react';
import { Button } from '../Components/Base';
import { TitleSceneButtonKey } from '@/Core/UIConfigTypes';

const defaultItem = {
  key: TitleSceneButtonKey.Game_start_button,
  content: '',
  args: {
    hide: false,
    style: {},
    hoverStyle: {},
  },
};

export default function GlobalDialog() {
  const isGlobalDialogShow = useSelector((state: RootState) => state.GUI.showGlobalDialog);
  return <>{isGlobalDialogShow && <div id="globalDialogContainer" />}</>;
}

interface IShowGlobalDialogProps {
  title: string;
  content?: string;
  suffixContent?: string;
  leftText?: string;
  rightText: string;
  leftFunc?: Function;
  rightFunc: Function;
  type?: 'normal' | 'pay';
}

export function showGlogalDialog(props: IShowGlobalDialogProps) {
  const { playSeClick, playSeEnter } = useSEByWebgalStore();
  const modalType = props.type ?? 'normal';
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: true }));
  const handleLeft = () => {
    playSeClick();
    props.leftFunc?.();
    hideGlobalDialog();
  };
  const handleRight = () => {
    playSeClick();
    props.rightFunc();
    hideGlobalDialog();
  };
  let renderElement: React.ReactNode | null = null;
  let clickedTime = 0;

  if (modalType === 'normal') {
    renderElement = (
      <div className={styles.GlobalDialog_main}>
        <div className={styles.glabalDialog_container}>
          <div className={styles.glabalDialog_container_inner}>
            <div className={styles.title}>{props.title}</div>
            <div className={styles.button_list}>
              {!!props.leftText && (
                <div
                  className={`${styles.button} interactive`}
                  onMouseEnter={playSeEnter}
                  onMouseDown={(e) => {
                    const node = e.currentTarget as HTMLDivElement;
                    node.className = `${styles.button} interactive btn-clicked`;
                    clickedTime = Date.now();
                  }}
                  onMouseUp={(e) => {
                    const duration = Date.now() - clickedTime;
                    let node = e.currentTarget;

                    setTimeout(
                      () => {
                        node.className = `${styles.button} interactive`;
                        // @ts-ignore
                        node = null;

                        setTimeout(() => {
                          handleLeft();
                        }, 320);
                      },
                      duration - 350 > 0 ? 0 : 350 - duration,
                    );
                  }}
                >
                  {props.leftText}
                </div>
              )}
              <div
                className={`${styles.button} interactive`}
                onMouseEnter={playSeEnter}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = `${styles.button} interactive btn-clicked`;
                  clickedTime = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTime;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = `${styles.button} interactive`;
                      // @ts-ignore
                      node = null;

                      setTimeout(() => {
                        handleRight();
                      }, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
              >
                {props.rightText}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (modalType === 'pay') {
    renderElement = (
      <div className={styles.GlobalDialog_main}>
        <div className={styles.GlobalDialog_pay_container}>
          <div className={styles.GlobalDialog_pay_tip} />
          <div
            className={`${styles.GlobalDialog_pay_close} interactive`}
            onMouseEnter={playSeEnter}
            onMouseDown={(e) => {
              const node = e.currentTarget as HTMLDivElement;
              node.className = `${styles.GlobalDialog_pay_close} interactive btn-clicked`;
              clickedTime = Date.now();
            }}
            onMouseUp={(e) => {
              const duration = Date.now() - clickedTime;
              let node = e.currentTarget;

              setTimeout(
                () => {
                  node.className = `${styles.GlobalDialog_pay_close} interactive`;
                  // @ts-ignore
                  node = null;

                  setTimeout(() => {
                    playSeClick();
                    handleLeft();
                    hideGlobalDialog();
                  }, 320);
                },
                duration - 350 > 0 ? 0 : 350 - duration,
              );
            }}
          />
          <div className={styles.GlobalDialog_pay_title}>{props.title}</div>
          <div className={styles.GlobalDialog_pay_content}>
            {props.content}
            <span className={styles.GlobalDialog_star_stone} />
            {props.suffixContent}
          </div>
          <div className={styles.GlobalDialog_pay_btns}>
            <div
              className={`${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_cancel} interactive`}
              onMouseEnter={playSeEnter}
              onMouseDown={(e) => {
                const node = e.currentTarget as HTMLDivElement;
                node.className = `${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_cancel} interactive btn-clicked`;
                clickedTime = Date.now();
              }}
              onMouseUp={(e) => {
                const duration = Date.now() - clickedTime;
                let node = e.currentTarget;

                setTimeout(
                  () => {
                    node.className = `${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_cancel} interactive`;
                    // @ts-ignore
                    node = null;

                    setTimeout(() => {
                      handleLeft();
                    }, 320);
                  },
                  duration - 350 > 0 ? 0 : 350 - duration,
                );
              }}
            />
            <div
              className={`${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_confirm} interactive`}
              onMouseEnter={playSeEnter}
              onMouseDown={(e) => {
                const node = e.currentTarget as HTMLDivElement;
                node.className = `${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_confirm}  interactive btn-clicked`;
                clickedTime = Date.now();
              }}
              onMouseUp={(e) => {
                const duration = Date.now() - clickedTime;
                let node = e.currentTarget;

                setTimeout(
                  () => {
                    node.className = `${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_confirm} interactive`;
                    // @ts-ignore
                    node = null;

                    setTimeout(() => {
                      handleRight();
                    }, 320);
                  },
                  duration - 350 > 0 ? 0 : 350 - duration,
                );
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  setTimeout(() => {
    // @ts-ignore
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(renderElement, document.getElementById('globalDialogContainer'));
  }, 100);
}

export function hideGlobalDialog() {
  webgalStore.dispatch(setVisibility({ component: 'showGlobalDialog', visibility: false }));
}

export function showControls() {
  webgalStore.dispatch(setVisibility({ component: 'showControls', visibility: true }));
}

export function hideControls() {
  webgalStore.dispatch(setVisibility({ component: 'showControls', visibility: false }));
}

export function switchControls() {
  if (webgalStore.getState().GUI.showControls === true) {
    hideControls();
  } else {
    showControls();
  }
}
