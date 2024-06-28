import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
// import { CloseSmall } from '@icon-park/react';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { ExtraCg } from './ExtraCg';
import background from '@/assets/imgs/gallery-bg.webp';
import cgunselect from '@/assets/imgs/cg-unselect.png';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useEffect, useState } from 'react';

export function Extra() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();
  const [checked, setCheked] = useState('bgm');
  useEffect(() => {
    const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
    bgmControl.pause();
  }, []);

  // const t = useTrans('extra.');
  return (
    <>
      {showExtra && (
        <div
          className={styles.extra}
          style={{
            background: `url(${background}) no-repeat center center`,
            backgroundSize: 'cover',
          }}
        >
          <div className={styles.extraTop}>
            <div
              className={styles.backIcon}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
            />
          </div>
          <div className={styles.mainContainer}>
            <div className={styles.mainTab}>
              {checked === 'bgm' ? (
                <span className={styles.mainTab_bgm} />
              ) : (
                <span
                  className={styles.mainTab_unselect_bgm}
                  onClick={() => {
                    setCheked('bgm');
                    playSeClick();
                  }}
                  onMouseEnter={playSeEnter}
                />
              )}
              {checked === 'cg' ? (
                <span className={styles.mainTab_cg} />
              ) : (
                <span
                  className={styles.mainTab_unselect_cg}
                  onClick={() => {
                    setCheked('cg');
                    playSeClick();
                  }}
                  onMouseEnter={playSeEnter}
                />
              )}
            </div>
            {checked === 'bgm' ? <ExtraBgm /> : <ExtraCg />}
          </div>
        </div>
      )}
    </>
  );
}
