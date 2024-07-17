import { FC, useEffect, useRef } from 'react';
import styles from './logo.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { useValue } from '@/hooks/useValue';

/**
 * 标识
 * @constructor
 */
const Logo: FC = () => {
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const logoImage = GUIState.logoImage;
  const isEnterGame = GUIState.isEnterGame;
  const currentLogoIndex = useValue(-1);
  const currentTimeOutId = useValue<any>(-1);
  const animationDuration = 5000;

  const nextImg = () => {
    clearTimeout(currentTimeOutId.value);
    if (currentLogoIndex.value < logoImage.length - 1) {
      currentLogoIndex.set(currentLogoIndex.value + 1);
      currentTimeOutId.set(setTimeout(nextImg, animationDuration));
    } else {
      currentLogoIndex.set(-1);
      if (GUIState?.isShowR18Modal) {
        dispatch(
          setVisibility({
            component: 'openR18Modal',
            visibility: true,
          }),
        );
      }
    }
  };

  useEffect(() => {
    if (isEnterGame && logoImage.length > 0) {
      /**
       * 启动 Enter Logo
       */
      currentLogoIndex.set(0);
      currentTimeOutId.set(setTimeout(nextImg, animationDuration));
    }
  }, [isEnterGame, logoImage]);

  const currentLogoUrl = currentLogoIndex.value === -1 ? '' : logoImage[currentLogoIndex.value];
  return (
    <>
      {currentLogoIndex.value !== -1 && (
        <div
          key={currentLogoIndex.value + 'wh'}
          className={
            styles.Logo_Back + ' ' + (currentLogoIndex.value === logoImage.length - 1 ? styles.animationActive : '')
          }
          style={{
            animationDuration: `${animationDuration}ms`,
          }}
        />
      )}
      {currentLogoUrl !== '' && (
        <>
          <div
            className={styles.Logo_main}
            key={currentLogoIndex.value + 'bg'}
            onClick={nextImg}
            style={{ backgroundImage: `url("${currentLogoUrl}")`, animationDuration: `${animationDuration}ms` }}
          />
          <div className={styles.overlay} />
        </>
      )}
    </>
  );
};

export default Logo;
