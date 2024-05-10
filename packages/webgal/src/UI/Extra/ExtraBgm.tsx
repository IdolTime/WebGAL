import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import styles from '@/UI/Extra/extra.module.scss';
import { useValue } from '@/hooks/useValue';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setGuiAsset } from '@/store/GUIReducer';
import bgmstar from '@/assets/images/cg/bgm-star.png';
import soundunselect from '@/assets/images/cg/sound-unselect.png';
import soundChoose from '@/assets/images/cg/sound-choose.png';
import unlockBgm from '@/assets/images/cg/unlock-bgm.png';
import footerLeft from '@/assets/images/cg/cg-bottom-left.png';
import footerRight from '@/assets/images/cg/cg-bottom-right.png';
import footerChecked from '@/assets/images/cg/cg-bottom-checked.png';
import footerUncheck from '@/assets/images/cg/cg-bottom-uncheck.png';


export function ExtraBgm() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<any[]>([])
  // 检查当前正在播放的bgm是否在bgm列表内
  const currentBgmSrc = useSelector((state: RootState) => state.GUI.titleBgm);
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const initName = 'Title_BGM';
  let foundCurrentBgmName = initName;
  const bgmListLen = extraState.bgm.length;
  extraState.bgm.forEach((e, i) => {
    if (e.url === currentBgmSrc) {
      foundCurrentBgmName = e.name;
    }
  });

  const currentPlayingBgmName = useValue('');
  if (foundCurrentBgmName !== initName && foundCurrentBgmName !== currentPlayingBgmName.value) {
    currentPlayingBgmName.set(foundCurrentBgmName);
  }
  const dispatch = useDispatch();

  useEffect(() => {
    setList(extraState.bgm.slice((page - 1) * 8, page * 8)|| [])
  }, [extraState.bgm, page])

  return (
    <div className={styles.bgmContainer}>
      <div className={styles.bgmListContainer}>
        {
          list.map((e, i) => {
            return (
              <div
                onClick={() => {
                  playSeClick();
                  currentPlayingBgmName.set(e.name);
                  dispatch(setGuiAsset({ asset: 'titleBgm', value: e.url }));
                }}
                key={e.name}
                className={styles.bgmElement}
                onMouseEnter={playSeEnter}
              >
                <img src={bgmstar} alt="" className={styles.bgmStar} />
                <div className={`${styles.bgmName} ${e.name === currentPlayingBgmName.value ? styles.bgmNameActive : ''}`}>
                  <div className={styles.bgm_item_name}>{e.name}</div>
                  <img 
                    src={e.name === currentPlayingBgmName.value ? soundChoose : soundunselect} 
                    alt="" 
                    className={e.name === currentPlayingBgmName.value ? styles.soundChoose : styles.soundunselect} 
                  />
                </div>
              </div>
            );
          })
        }
        {
          Array.from({ length: 8 - list.length }).map((e, i) => {
            return (
              <div className={styles.bgmElement} style={{cursor: 'default'}}>
                <img src={unlockBgm} alt="" className={styles.unlockBgm} />
              </div>
            )
          })
        }
      </div>
      <div className={styles.footer}>
        <img 
          src={footerLeft} 
          alt="" 
          className={styles.footerButton} 
          onClick={() => {
            playSeClick();
            if (page > 1) {
              setPage(page - 1);
            }
          }}
          onMouseEnter={playSeEnter}
        />
        <div className={styles.footer_page_container}>
          {
            Array.from({ length: Math.ceil(bgmListLen/8) }).map((e, i) => {
              return (
                <img src={(i + 1) === page ? footerChecked : footerUncheck} alt="" className={styles.footerPageIcon} />
              )
            })
          }
        </div>
        <img 
          src={footerRight} 
          alt="" 
          className={styles.footerButton}
          onClick={() => {
            playSeClick();
            if (page === Math.ceil(bgmListLen/8)) {
              return;
            }
            setPage(page + 1);
          }}
          onMouseEnter={playSeEnter}
        />
      </div>
    </div>
  );
}
