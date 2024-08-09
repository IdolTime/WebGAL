import { useEffect, useRef, useState } from 'react';
import BuyGameBg from '@/assets/imgs/buy-game-bg.png';
import ModalClose from '@/assets/imgs/modal-close.png';
import styles from './buyGame.module.scss';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { SourceImg } from '../Components/SourceImg';
import { buyGame } from '@/services/store';
import BuyGameSuccess from '@/assets/imgs/buy-game-success.png';

export function ModalBuyGame() {
  const [visible, setVisible] = useState(false);
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const { gameInfo } = useSelector((state: RootState) => state.storeData);
  const callbackRef = useRef({
    buyGameCallback: () => {},
    startGameCallback: () => {},
  });

  const submitBuy = async () => {
    playSeClick();
    const res = await buyGame();

    if (res.code === 0 || res.code === 10053) {
      // if (res.code === 0) {
      // @ts-ignore
      res.code === 0 && window.pubsub.publish('toaster', { show: true, image: BuyGameSuccess, animation: 'slideIn' });
      setVisible(false);
      callbackRef.current.startGameCallback();
    } else if (res.code === 10014) {
      // } else if (res.code === 10053) {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: '余额不足, 请充值' });
      // @ts-ignore
      window.pubsub.publish('rechargeModal', {});
    } else {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: res.message });
    }
  };

  useEffect(() => {
    // @ts-ignore
    const dispose = window.pubsub.subscribe('showBuyGameModal', ({ buyGameCallback, startGameCallback }) => {
      setVisible(true);
      callbackRef.current = {
        buyGameCallback,
        startGameCallback,
      };
    });

    return dispose;
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.BuyGame_container}>
      <div className={styles.BuyGame_inner}>
        <SourceImg src={BuyGameBg} />
        <SourceImg
          src={ModalClose}
          className={styles.BuyGame_close}
          onMouseEnter={playSeEnter}
          onClick={() => {
            playSeClick();
            setVisible(false);
            callbackRef.current.buyGameCallback();
          }}
        />
        <span className={styles.BuyGame_price}>{gameInfo?.salesAmount || 0}</span>
        <div className={styles.BuyGame_button} onClick={submitBuy} onMouseEnter={playSeEnter}>
          <span className={styles.BuyGame_button_text}>购买</span>
        </div>
      </div>
    </div>
  );
}
