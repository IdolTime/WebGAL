import { useValue } from '@/hooks/useValue';
import styles from '@/UI/Extra/extra.module.scss';
import React from 'react';
import useSoundEffect from '@/hooks/useSoundEffect';
import cgUnLock from '@/assets/imgs//cg-unLock.png';
import FlvPlayer from '../FlvPlayer';
import FlvJs from 'flv.js';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

interface IProps {
  name: string;
  url: string;
  poster?: string;
}

export function ExtraCgElement(props: IProps) {
  const showFull = useValue(false);
  const { playSeEnter, playSeClick } = useSoundEffect();
  const isVideo = props.url.endsWith('.mp4') || props.url.endsWith('.flv');
  const videoPlayerRef = React.useRef<FlvJs.FlvPlayer>(null);
  const bgmNode = document.getElementById('currentBgm') as HTMLAudioElement;
  const url = assetSetter(props.url, isVideo ? fileType.video : fileType.background);
  const poster = isVideo && props.poster ? assetSetter(props.poster, fileType.image) : '';

  let bgmVol = 0;

  if (bgmNode) {
    bgmVol = bgmNode.volume;
  }

  return (
    <>
      {showFull.value && (
        <div
          onClick={() => {
            showFull.set(!showFull.value);
            playSeClick();
            bgmNode.volume = bgmVol;
          }}
          className={`${styles.showFullContainer} interactive`}
          onMouseEnter={playSeEnter}
        >
          <div className={styles.showFullCgMain}>
            {isVideo ? (
              <FlvPlayer
                videoPlayerRef={videoPlayerRef}
                url={url}
                controls
                autoPlay={false}
                muted
                key={url + props.name}
              />
            ) : (
              <div
                style={{
                  backgroundImage: `url('${url}')`,
                  backgroundSize: `cover`,
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '100%',
                }}
              />
            )}
          </div>
        </div>
      )}
      <div
        onClick={() => {
          showFull.set(!showFull.value);
          bgmNode.volume = 0;
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
        key={props.name}
        className={`${styles.cgElement} ${styles.cgUnLockElement} interactive`}
      >
        {isVideo ? (
          <div
            className={`${styles.videoContainer} ${styles.unlockedCGImg}`}
            style={
              poster
                ? {
                    background: `url('${poster}') no-repeat center center`,
                    backgroundSize: `cover`,
                  }
                : undefined
            }
          >
            {!poster && (
              <FlvPlayer
                videoPlayerRef={videoPlayerRef}
                url={url}
                controls={false}
                autoPlay={false}
                muted
                key={url + props.name}
              />
            )}
            <span className={styles.playButtonIcon} />
          </div>
        ) : (
          <div
            className={styles.unlockedCGImg}
            style={{
              background: `url('${url}') no-repeat center center`,
              backgroundSize: `cover`,
            }}
          />
        )}
      </div>
    </>
  );
}
