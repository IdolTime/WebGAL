import { useEffect, useRef, useState } from 'react';
import styles from './toaster.module.scss';

interface IToasterConfig {
  show: boolean;
  image?: string;
  text?: string;
  duration?: number;
}

let animationDuration = 510;

export function Toaster() {
  const [visible, setVisible] = useState(false);
  const [option, setOption] = useState<Omit<IToasterConfig, 'show' | 'duration'>>({});
  const [animationOut, setAnimationOut] = useState(false);
  const timerRef = useRef<any>({
    showTimer: null,
    animationTimer: null,
  });

  useEffect(() => {
    const clear = () => {
      if (timerRef.current.showTimer) {
        clearTimeout(timerRef.current.showTimer);
        timerRef.current.showTimer = null;
      }
      if (timerRef.current.animationTimer) {
        clearTimeout(timerRef.current.animationTimer);
        timerRef.current.animationTimer = null;
      }
      setAnimationOut(false);
    };

    // @ts-ignore
    const dispose = window.pubsub.subscribe('toaster', (option: IToasterConfig) => {
      if (option.show) {
        setOption(option);
        clear();
        setVisible(true);
        timerRef.current.showTimer = setTimeout(() => {
          setAnimationOut(true);
          // eslint-disable-next-line max-nested-callbacks
          timerRef.current.animationTimer = setTimeout(() => {
            setVisible(false);
            setAnimationOut(false);
          }, animationDuration);
        }, option.duration ?? 3000);
      }
    });

    return () => {
      dispose();
      clear();
    };
  }, []);

  if (!visible) return null;

  const classNames = [
    styles.Toaster_container,
    option.image ? styles.Toaster_image : '',
    animationOut ? styles.Toaster_out : '',
  ].join(' ');

  return (
    <div className={classNames}>
      {option.image && <img src={option.image} />}
      {option.text && <div className={styles.Toaster_text}>{option.text}</div>}
    </div>
  );
}
