import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
// import { CloseSmall } from '@icon-park/react';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { ExtraCg } from './ExtraCg';
import background from '@/assets/imgs//background.png';
import backTitle from '@/assets/imgs//back-title.png';
import cgbgmBg from '@/assets/imgs//cg-bgm-bg.png';
import cgunselect from '@/assets/imgs//cg-unselect.png';
import bgmunselect from '@/assets/imgs//bgm-unselect.png';
import tabchoose from '@/assets/imgs//tab-choose.png';
import cgchoose from '@/assets/imgs//cg-choose.png';
import bgmchoose from '@/assets/imgs//bgm-choose.png';
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
            <img src={backTitle} alt="" style={{ width: '100%', objectFit: 'cover' }} />
            {/* <CloseSmall
              className={styles.extra_top_icon}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                playSeClick();
              }}
              onMouseEnter={playSeClick}
              theme="outline"
              size="4em"
              fill="#fff"
              strokeWidth={3}
            />
            <div className={styles.extra_title}>{t('title')}</div> */}
          </div>
          <div className={styles.mainContainer}>
            <div className={styles.mainTab}>
              <img src={cgbgmBg} alt="" className={styles.mainTab_bg} />
              {checked === 'bgm' ? (
                <div className={`${styles.mainTab_choose} ${styles.mainTab_choose_bgm}`}>
                  <img src={bgmchoose} alt="" className={styles.mainTab_text} />
                </div>
              ) : (
                <img
                  src={bgmunselect}
                  alt=""
                  className={`${styles.mainTab_unselect} ${styles.mainTab_unselect_bgm}`}
                  onClick={() => {
                    setCheked('bgm');
                    playSeClick();
                  }}
                  onMouseEnter={playSeEnter}
                />
              )}
              {checked === 'cg' ? (
                <div className={`${styles.mainTab_choose} ${styles.mainTab_choose_cg}`}>
                  <img src={cgchoose} alt="" className={styles.mainTab_text} />
                </div>
              ) : (
                <img
                  src={cgunselect}
                  alt=""
                  className={`${styles.mainTab_unselect} ${styles.mainTab_unselect_cg}`}
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
