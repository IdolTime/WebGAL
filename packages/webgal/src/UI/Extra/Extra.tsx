import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { CloseSmall } from '@icon-park/react';
// import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
// import { ExtraCg } from './ExtraCg';
import { ExtraVideo } from './ExtraVideo'
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useEffect } from 'react';
import { saveActions } from '@/store/savesReducer';

export function Extra() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();

  const t = useTrans('extra.');

  useEffect(() => {
    if (showExtra) {
      dispatch(saveActions.setLoadVideo(true));
    }
  }, [showExtra])

  return (
    <>
      {showExtra && (
        <div className={styles.extra}>
          <div className={styles.extra_top}>
            <CloseSmall
              className={styles.extra_top_icon}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                dispatch(saveActions.setLoadVideo(false));
                playSeClick();
              }}
              onMouseEnter={playSeEnter}
              theme="outline"
              size="3em"
              fill="#fff"
              strokeWidth={3}
            />
            <div className={styles.extra_title}>{t('title')}</div>
          </div>
          <div className={styles.mainContainer}>
            {/* <ExtraCg />
            <ExtraBgm /> */}
            <ExtraVideo />
          </div>
        </div>
      )}
    </>
  );
}
