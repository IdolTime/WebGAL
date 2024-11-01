import styles from '@/UI/Extra/extra.module.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import './extraCG_animation_List.scss';
import { ExtraCgElement } from '@/UI/Extra/ExtraCgElement';
import useSoundEffect from '@/hooks/useSoundEffect';
import footerChecked from '@/assets/imgs/point-active.png';
import footerUncheck from '@/assets/imgs/point-default.png';
import cgLock from '@/assets/imgs//cg-lock.png';
import { IAppreciationAsset } from '@/store/userDataInterface';

export function ExtraCg() {
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<IAppreciationAsset[]>([]);

  const cgLen = extraState.cg.length;
  const pageLen = Math.ceil(cgLen / 6) || 1;

  const filteredList = useMemo(() => {
    const listMap: Record<string, boolean> = {};
    const newList: IAppreciationAsset[] = [];
    extraState.cg.forEach((e) => {
      if (!listMap[e.url]) {
        listMap[e.url] = true;
        newList.push(e);
      }
    });
    return newList;
  }, [extraState.cg]);

  useEffect(() => {
    setList(filteredList.slice((page - 1) * 6, page * 6) || []);
  }, [filteredList, page]);

  return (
    <div className={styles.cgMain}>
      <div className={styles.cgContainer}>
        {list.map((e, i) => {
          return <ExtraCgElement name={e.name} url={e.url} poster={e.poster} key={i.toString() + e.url} />;
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
