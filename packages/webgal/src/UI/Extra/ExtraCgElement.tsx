import { useValue } from '@/hooks/useValue';
import styles from '@/UI/Extra/extra.module.scss';
import React from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import cgUnLock from '@/assets/imgs//cg-unLock.png';

interface IProps {
  name: string;
  imgUrl: string;
}

export function ExtraCgElement(props: IProps) {
  const showFull = useValue(false);
  const { playSeEnter, playSeClick } = useSoundEffect();
  return (
    <>
      {showFull.value && (
        <div
          onClick={() => {
            showFull.set(!showFull.value);
            playSeClick();
          }}
          className={`${styles.showFullContainer} interactive`}
          onMouseEnter={playSeEnter}
        >
          <div className={styles.showFullCgMain}>
            <div
              style={{
                backgroundImage: `url('${props.imgUrl}')`,
                backgroundSize: `cover`,
                backgroundPosition: 'center',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      )}
      <div
        onClick={() => {
          showFull.set(!showFull.value);
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
        key={props.name}
        className={`${styles.cgElement} ${styles.cgUnLockElement} interactive`}
      >
        <div
          className={styles.unlockedCGImg}
          style={{
            background: `url('${props.imgUrl}') no-repeat center center`,
            backgroundSize: `cover`,
          }}
        />
      </div>
    </>
  );
}
