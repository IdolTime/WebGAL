import styles from '@/UI/Extra/extra.module.scss';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import './extraCG_animation_List.scss';
import { ExtraCgElement } from '@/UI/Extra/ExtraCgElement';
import useSoundEffect from '@/hooks/useSoundEffect';
import footerLeft from '@/assets/cg/cgBottomLeft.png';
import footerRight from '@/assets/cg/cgBottomRight.png';
import footerChecked from '@/assets/cg/cgBottomChecked.png';
import footerUncheck from '@/assets/cg/cgBottomUncheck.png';
import cgLock from '@/assets/cg/cgLock.png';

export function ExtraCg() {
  const extraState = useSelector((state: RootState) => state.userData.appreciationData);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<any[]>([])

  console.log(extraState.cg, 'extraState.cg');
  const cgLen = extraState.cg.length;

  useEffect(() => {
    setList(extraState.cg.slice((page - 1) * 6, page * 6)|| [])
    console.log(page, 'page')
  }, [extraState.cg, page])

  return (
    <div className={styles.cgMain}>
      <div className={styles.cgContainer}>
        {
          list.map((e, i) => {
            return (
              <ExtraCgElement
                name={e.name}
                imgUrl={e.url}
                key={i.toString() + e.url}
              />
            );
          })
        }
        {
          Array.from({ length: 6 - list.length }).map((e, i) => {
            return (
              <div className={styles.cgElement} key={i} style={{cursor: 'default'}}>
                <img src={cgLock} alt="" style={{width: '100%'}} />
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
            Array.from({ length: Math.ceil(cgLen/6) }).map((e, i) => {
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
            if (page === Math.ceil(cgLen/6)) {
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

