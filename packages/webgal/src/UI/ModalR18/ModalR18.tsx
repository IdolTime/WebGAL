import { CSSProperties, FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setGameR18 } from '@/store/GUIReducer';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import styles from './ModalR18.module.scss';
import ExitButtonDefault from '@/assets/imgs/r18-exit-btn-default.png';
import ExitButtonHover from '@/assets/imgs/r18-exit-btn-default.png';
import ConfirmButtonDefault from '@/assets/imgs/r18-confirm-btn-active.png';
import ConfirmButtonHover from '@/assets/imgs/r18-confirm-btn-active.png';

export const ModalR18: FC = () => {
  const t = useTrans('r18.');
  const dispatch = useDispatch();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const { playSeClick, playSeEnter } = useSoundEffect();
  const [isHoverExitButton, setIsHoverExitButton] = useState(false);
  const [isHoverConfirmButton, setIsHoverConfirmButton] = useState(false);
  const [exitButtonLayout, setExitButtonLayout] = useState<Pick<CSSProperties, 'width' | 'height' | 'opacity'>>({
    width: undefined,
    height: undefined,
    opacity: 0,
  });
  const [confirmButtonLayout, setConfirmButtonLayout] = useState<Pick<CSSProperties, 'width' | 'height' | 'opacity'>>({
    width: undefined,
    height: undefined,
    opacity: 0,
  });

  const handleAgree = () => {
    playSeClick();
    dispatch(setGameR18(false));
  };

  const handleDisagree = () => {
    playSeClick();
    window.location.href = '/';
  };

  return (
    <>
      {GUIStore.isShowR18Modal && GUIStore.openR18Modal && (
        <div className={styles.modalR18_main}>
          <div className={styles.footer}>
            <div id="exitButton">
              <img
                src={isHoverExitButton ? ExitButtonHover : ExitButtonDefault}
                onClick={handleDisagree}
                onMouseEnter={() => {
                  setIsHoverExitButton(true);
                  playSeEnter();
                }}
                onMouseLeave={() => {
                  setIsHoverExitButton(false);
                }}
                onLoad={(e) => {
                  // @ts-ignore
                  setExitButtonLayout({
                    width: (e.target as HTMLImageElement).naturalWidth / 0.5,
                    height: (e.target as HTMLImageElement).naturalHeight / 0.5,
                    opacity: 1,
                  });
                }}
                style={exitButtonLayout}
              />
            </div>
            <div id="confirmButton">
              <img
                src={isHoverConfirmButton ? ConfirmButtonHover : ConfirmButtonDefault}
                onClick={handleAgree}
                onMouseEnter={() => {
                  setIsHoverExitButton(true);
                  playSeEnter();
                }}
                onMouseLeave={() => {
                  setIsHoverExitButton(false);
                }}
                onLoad={(e) => {
                  setConfirmButtonLayout({
                    width: (e.target as HTMLImageElement).naturalWidth / 0.5,
                    height: (e.target as HTMLImageElement).naturalHeight / 0.5,
                    opacity: 1,
                  });
                }}
                style={confirmButtonLayout}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
