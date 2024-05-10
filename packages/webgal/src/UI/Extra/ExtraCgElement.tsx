import { useValue } from '@/hooks/useValue';
import styles from '@/UI/Extra/extra.module.scss';
import React from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import cgUnLock from '@/assets/cg/cgUnLock.png';

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
          className={styles.showFullContainer}
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
        className={styles.cgElement}
      >
        <img src={cgUnLock} alt="" style={{width: '100%'}} />
        <div
          style={{
            background: `url('${props.imgUrl}') no-repeat center center`,
            backgroundSize: `cover`,
          }}
          className={styles.cgUnLock}
        />
      </div>
    </>
  );
}
