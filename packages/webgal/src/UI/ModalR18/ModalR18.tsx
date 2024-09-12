import { CSSProperties, FC, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setGameR18 } from '@/store/GUIReducer';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import styles from './ModalR18.module.scss';
import ExitButtonDefault from '@/assets/imgs/r18-exit-btn-default.png';
import ExitButtonHover from '@/assets/imgs/r18-exit-btn-active.png';
import ConfirmButtonDefault from '@/assets/imgs/r18-confirm-btn-default.png';
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
  const clickedTimeRef = useRef(0);

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
        <div
          className={`${styles.modalR18_main} ${
            GUIStore.isShowR18Modal && GUIStore.openR18Modal ? 'animated fadeIn' : ''
          }`}
        >
          <div className={styles.footer}>
            <div id="exitButton">
              <img
                src={isHoverExitButton ? ExitButtonHover : ExitButtonDefault}
                onClick={handleDisagree}
                className="interactive"
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
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = 'interactive btn-clicked';
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = 'interactive';
                      // @ts-ignore
                      node = null;

                      setTimeout(handleAgree, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
                }}
                style={exitButtonLayout}
              />
            </div>
            <div id="confirmButton">
              <img
                className="interactive"
                src={isHoverConfirmButton ? ConfirmButtonHover : ConfirmButtonDefault}
                onMouseEnter={() => {
                  setIsHoverConfirmButton(true);
                  playSeEnter();
                }}
                onMouseLeave={() => {
                  setIsHoverConfirmButton(false);
                }}
                onLoad={(e) => {
                  setConfirmButtonLayout({
                    width: (e.target as HTMLImageElement).naturalWidth / 0.5,
                    height: (e.target as HTMLImageElement).naturalHeight / 0.5,
                    opacity: 1,
                  });
                }}
                onMouseDown={(e) => {
                  const node = e.currentTarget as HTMLDivElement;
                  node.className = 'interactive btn-clicked';
                  clickedTimeRef.current = Date.now();
                }}
                onMouseUp={(e) => {
                  const duration = Date.now() - clickedTimeRef.current;
                  let node = e.currentTarget;

                  setTimeout(
                    () => {
                      node.className = 'interactive';
                      // @ts-ignore
                      node = null;

                      setTimeout(handleAgree, 320);
                    },
                    duration - 350 > 0 ? 0 : 350 - duration,
                  );
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
