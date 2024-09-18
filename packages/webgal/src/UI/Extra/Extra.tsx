import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { ExtraVideo } from './ExtraVideo';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useEffect } from 'react';
import { saveActions } from '@/store/savesReducer';
import { BgImage } from '@/UI/Components/Base';
import {
  ExtraSceneOtherKey,
  Scene,
  ExtraSceneUIConfig
} from '@/Core/UIConfigTypes';

export function Extra() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();

  const extraSceneUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.extra],
  ) as ExtraSceneUIConfig;

  const t = useTrans('extra.');

  useEffect(() => {
    if (showExtra) {
      dispatch(saveActions.setLoadVideo(true));
      console.log(extraSceneUIConfigs);
      debugger; // Extra_bgm_unlocked_item 已解锁
    }
  }, [showExtra]);

  const handleGoBack = () => {
    playSeClick();
    dispatch(setVisibility({ component: 'showExtra', visibility: false }));
    dispatch(saveActions.setLoadVideo(false));
  };

  return (
    <>
      {showExtra && (
        <div className={styles.extra}>
          <BgImage
            item={extraSceneUIConfigs.other[ExtraSceneOtherKey.Extra_bg]}
            defaultClass={styles.extra_bg}
          />
          <div className={styles.mainContainer}>
            <ExtraVideo />
          </div>
        </div>
      )}
    </>
  );
}
