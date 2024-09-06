import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
// import { CloseSmall } from '@icon-park/react';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { ExtraVideo } from '@/UI/Extra/ExtraVideo';
import useTrans from '@/hooks/useTrans';
import { ExtraCg } from './ExtraCg';
import background from '@/assets/imgs/gallery-bg.webp';
import cgunselect from '@/assets/imgs/cg-unselect.png';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useEffect, useState } from 'react';
import { saveActions } from '@/store/savesReducer';
import { Button } from '../Components/Base';
import { ExtraSceneOtherKey, ExtraSceneUIConfig, Scene } from '@/Core/UIConfigTypes';

export function Extra() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();
  const [checked, setCheked] = useState('bgm');
  const extraUIConfigs = useSelector((state: RootState) => state.GUI.gameUIConfigs[Scene.extra]) as ExtraSceneUIConfig;
  useEffect(() => {
    const bgmControl: HTMLAudioElement = document.getElementById('currentBgm') as HTMLAudioElement;
    bgmControl.pause();
  }, []);

  useEffect(() => {
    if (showExtra) {
      dispatch(saveActions.setLoadVideo(true));
    }
  }, [showExtra]);

  const handleGoBack = () => {
    playSeClick();
    dispatch(setVisibility({ component: 'showExtra', visibility: false }));
    dispatch(saveActions.setLoadVideo(false));
  };

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
          <Button
            item={extraUIConfigs.buttons.Extra_back_button}
            defaultClass={styles.backIcon}
            onClick={handleGoBack}
            onMouseEnter={playSeEnter}
          />
          <Button item={extraUIConfigs.other[ExtraSceneOtherKey.Extra_title]} defaultClass={styles.extraTop} />
          <div className={styles.mainContainer}>
            <div className={styles.mainTab}>
              {checked === 'bgm' ? (
                <span className={`${styles.mainTab_bgm} interactive`} />
              ) : (
                <span
                  className={`${styles.mainTab_unselect_bgm} interactive`}
                  onClick={() => {
                    setCheked('bgm');
                    playSeClick();
                  }}
                  onMouseEnter={playSeEnter}
                />
              )}
              {checked === 'cg' ? (
                <span className={`${styles.mainTab_cg} interactive`} />
              ) : (
                <span
                  className={`${styles.mainTab_unselect_cg} interactive`}
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
