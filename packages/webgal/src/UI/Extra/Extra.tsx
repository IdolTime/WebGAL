import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
// import { CloseSmall } from '@icon-park/react';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { ExtraCg } from './ExtraCg';
import useTrans from '@/hooks/useTrans';
import backTitle from '@/assets/cg/backTitle.png';
import cgbgmBg from '@/assets/cg/cgbgmBg.png';
import cgunselect from '@/assets/cg/cgunselect.png';
import bgmunselect from '@/assets/cg/bgmunselect.png';
import tabchoose from '@/assets/cg/tabchoose.png';
import cgchoose from '@/assets/cg/cgchoose.png';
import bgmchoose from '@/assets/cg/bgmchoose.png';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useEffect, useState } from 'react';

export function Extra() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();
  const [checked, setCheked] = useState('bgm')
  useEffect(() => {
    console.log('2222')
    const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
    bgmControl.pause();
  }, [])
 
  // const t = useTrans('extra.');
  return (
    <>
      {showExtra && (
        <div className={styles.extra}>
          <div 
            className={styles.extra_top}
            onClick={() => {
              dispatch(setVisibility({ component: 'showExtra', visibility: false }));
              playSeClick();
            }}
            onMouseEnter={playSeEnter}
          >
            <img src={backTitle} alt="" style={{width: '100%', objectFit: 'cover'}} />
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
              <div className={styles.mainTab_item1}>
                {
                  checked === 'bgm' ?
                  (
                    <>
                      <img src={tabchoose} alt="" className={styles.mainTab_choose} />
                      <img src={bgmchoose} alt="" className={styles.mainTab_choose_bgm}  />
                    </>
                  )
                  :
                  <img 
                    src={bgmunselect} 
                    alt="" 
                    className={`${styles.mainTab_unselect} ${styles.mainTab_bgmunselect}`}
                    onClick={() => {
                      setCheked('bgm')
                      playSeClick()
                    }}
                    onMouseEnter={playSeEnter}
                  />
                }
              </div>
              <div className={styles.mainTab_item2} >
                {
                  checked === 'cg' ?
                  (
                    <>
                      <img src={tabchoose} alt="" className={styles.mainTab_choose} />
                      <img src={cgchoose} alt="" className={styles.mainTab_choose_cg}  />
                    </>
                  )
                  :
                  <img 
                    src={cgunselect} 
                    alt="" 
                    className={styles.mainTab_unselect} 
                    onClick={() => {
                      setCheked('cg')
                      playSeClick()
                    }}
                    onMouseEnter={playSeEnter}
                  />
                }
              </div>
            </div>
            {
              checked === 'bgm' ?
                <ExtraBgm />
              :
              <ExtraCg />
            }
          </div>
        </div>
      )}
    </>
  );
}
