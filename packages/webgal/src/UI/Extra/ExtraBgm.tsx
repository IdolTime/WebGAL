import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import styles from '@/UI/Extra/extra.module.scss';
import { useValue } from '@/hooks/useValue';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setGuiAsset } from '@/store/GUIReducer';
import soundunselect from '@/assets/imgs/sound-unselect.png';
import soundChoose from '@/assets/imgs/sound-choose.png';
import bgmLocked from '@/assets/imgs//bgm-locked-bg.png';
import bgmUnlocked from '@/assets/imgs//bgm-unlock-bg.png';
import footerChecked from '@/assets/imgs//cg-bottom-checked.png';
import footerUncheck from '@/assets/imgs//cg-bottom-uncheck.png';

export function ExtraBgm() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<any[]>([]);
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
  const pageLen = Math.ceil(bgmListLen / 8) || 1;

  const currentPlayingBgmName = useValue('');
  if (foundCurrentBgmName !== initName && foundCurrentBgmName !== currentPlayingBgmName.value) {
    currentPlayingBgmName.set(foundCurrentBgmName);
  }
  const dispatch = useDispatch();

  useEffect(() => {
    setList(extraState.bgm.slice((page - 1) * 8, page * 8) || []);
  }, [extraState.bgm, page]);

  return (
    <div className={styles.bgmContainer}>
      <div className={styles.bgmListContainer}>
        {list.map((e, i) => {
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
              <div className={styles.bgmName}>
                <div className={styles.bgm_item_name}>{e.name}</div>
                <div className={styles.bgm_sound_wrapper}>
                  <img
                    src={e.name === currentPlayingBgmName.value ? soundChoose : soundunselect}
                    alt=""
                    className={
                      e.name === currentPlayingBgmName.value ? styles.bgm_sound_select : styles.bgm_sound_unselect
                    }
                  />
                </div>
              </div>
              <img src={bgmUnlocked} className={styles.bgmUnlocked} alt="" />
            </div>
          );
        })}
        {Array.from({ length: 8 - list.length }).map((e, i) => {
          return (
            <div key={i} className={`${styles.bgmElement}`} style={{ cursor: 'default' }}>
              <img src={bgmLocked} alt="" className={styles.bgmLocked} />
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <div
          className={styles.Btn}
          onMouseEnter={playSeEnter}
          onClick={() => {
            playSeClick();
            if (page > 1) {
              setPage(page - 1);
            }
          }}
        />
        <div className={styles.footer_page_container}>
          {Array.from({ length: pageLen }).map((e, i) => {
            return (
              <div
                key={i}
                className={styles.footer_page_indicator}
                onMouseEnter={playSeEnter}
                onClick={() => {
                  playSeClick();
                  setPage(i + 1);
                }}
              >
                <img
                  src={i + 1 === page ? footerChecked : footerUncheck}
                  alt=""
                  className={i + 1 === page ? styles.footer_page_icon_checked : styles.footer_page_icon_unchecked}
                />
              </div>
            );
          })}
        </div>
        <div
          className={`${styles.Btn} ${styles.Btn_r}`}
          onMouseEnter={playSeEnter}
          onClick={() => {
            playSeClick();
            if (page === pageLen) {
              return;
            }
            setPage(page + 1);
          }}
        />
      </div>
    </div>
  );
}
