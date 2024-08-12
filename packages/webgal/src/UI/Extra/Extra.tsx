import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
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

  const handleGoBack = () => {
    playSeClick();
    dispatch(setVisibility({ component: 'showExtra', visibility: false }));
    dispatch(saveActions.setLoadVideo(false));
  }

  return (
    <>
      {showExtra && (
        <div className={styles.extra}>
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
