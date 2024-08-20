import styles from './globalDialog.module.scss';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import React from 'react';

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

  if (modalType === 'normal') {
    renderElement = (
      <div className={styles.GlobalDialog_main}>
        <div className={styles.glabalDialog_container}>
          <div className={styles.glabalDialog_container_inner}>
            <div className={styles.title}>{props.title}</div>
            <div className={styles.button_list}>
              {!!props.leftText && (
                <div className={styles.button} onClick={handleLeft} onMouseEnter={playSeEnter}>
                  {props.leftText}
                </div>
              )}
              <div className={styles.button} onClick={handleRight} onMouseEnter={playSeEnter}>
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
            className={styles.GlobalDialog_pay_close}
            onMouseEnter={playSeEnter}
            onClick={() => {
              playSeClick();
              handleLeft();
              hideGlobalDialog();
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
              className={`${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_cancel}`}
              onClick={handleLeft}
              onMouseEnter={playSeEnter}
            />
            <div
              className={`${styles.GlobalDialog_pay_btn} ${styles.GlobalDialog_pay_confirm}`}
              onClick={handleRight}
              onMouseEnter={playSeEnter}
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
