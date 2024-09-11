import styles from '@/UI/Extra/extra.module.scss';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import './extraCG_animation_List.scss';
import { ExtraCgElement } from '@/UI/Extra/ExtraCgElement';
import useSoundEffect from '@/hooks/useSoundEffect';
import footerLeft from '@/assets/imgs/cg-bottom-left.png';
import footerRight from '@/assets/imgs/cg-bottom-right.png';
import footerChecked from '@/assets/imgs/cg-bottom-checked.png';
import footerUncheck from '@/assets/imgs/cg-bottom-uncheck.png';
import cgLock from '@/assets/imgs//cg-lock.png';

export function ExtraCg() {
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<any[]>([]);

  const cgLen = extraState.cg.length;
  const pageLen = Math.ceil(cgLen / 6) || 1;

  useEffect(() => {
    setList(extraState.cg.slice((page - 1) * 6, page * 6) || []);
  }, [extraState.cg, page]);

  return (
    <div className={styles.cgMain}>
      <div className={styles.cgContainer}>
        {list.map((e, i) => {
          return <ExtraCgElement name={e.name} imgUrl={e.url} key={i.toString() + e.url} />;
        })}
        {Array.from({ length: 6 - list.length }).map((e, i) => {
          return (
            <div key={i} className={styles.cgElement} style={{ cursor: 'default' }}>
              <img src={cgLock} alt="" style={{ width: '100%' }} />
            </div>
          );
        })}
      </div>
      <div className={styles.footer}>
        <div
          className={`${styles.Btn} interactive`}
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
                className={`${styles.footer_page_indicator} interactive`}
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
          className={`${styles.Btn} ${styles.Btn_r} interactive`}
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
