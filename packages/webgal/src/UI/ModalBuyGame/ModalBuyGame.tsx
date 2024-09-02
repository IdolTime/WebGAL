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
import { px2 } from '@/Core/parser/utils';
import { sleep } from '@/Core/util/sleep';

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

    // @ts-ignore
    window.pubsub.publish('loading', { loading: false });

    await sleep(2000);

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
      {/* <div className={styles.BuyGame_inner}>
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
      </div> */}
      <div className={styles.BuyGame_pay_container}>
        <div className={styles.BuyGame_pay_tip} />
        <div
          className={styles.BuyGame_pay_close}
          onMouseEnter={playSeEnter}
          onClick={() => {
            playSeClick();
            setVisible(false);
            callbackRef.current.buyGameCallback();
          }}
        />
        <div className={styles.BuyGame_pay_title}>交易确认</div>
        <div className={styles.BuyGame_select_text}>您已选择1款游戏</div>
        <div className={styles.BuyGame_info_block}>
          <div className={styles.BuyGame_info_row}>
            <div className={styles.BuyGame_game_cover}>
              <div className={styles.BuyGame_game_cover_inner}>
                <img src={gameInfo?.coverPic || ''} />
              </div>
            </div>
            <div>
              <div className={styles.BuyGame_info_name}>{gameInfo?.name || '未知'}</div>
              <div className={styles.BuyGame_info_tag}>
                {gameInfo?.tagList.map((e) => (
                  <div className={styles.BuyGame_info_text} key={e.tagId}>
                    {e.tagName}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.BuyGame_info_row}>
            <span className={styles.BuyGame_info_text}>价格:</span>
            <div className={styles.BuyGame_info_price}>
              {gameInfo?.salesAmount || 0}
              <span className={styles.BuyGame_info_price_stone} />
            </div>
          </div>
        </div>
        <div className={styles.BuyGame_price_row}>
          <div className={styles.BuyGame_info_row}>
            <span className={styles.BuyGame_price_text} style={{ marginRight: px2(4) }}>
              总计:
            </span>
            <div className={styles.BuyGame_price_text}>
              {gameInfo?.salesAmount || 0}
              <span className={styles.BuyGame_price_stone} />
            </div>
          </div>
          <div className={styles.BuyGame_info_row}>
            <span className={styles.BuyGame_price_text} style={{ marginRight: px2(4) }}>
              应付总额:
            </span>
            <div className={styles.BuyGame_price_text}>
              {gameInfo?.salesAmount || 0}
              <span className={styles.BuyGame_price_stone} />
            </div>
            <div className={styles.BuyGame_price_button} onMouseEnter={playSeEnter} onClick={submitBuy} />
          </div>
        </div>
      </div>
    </div>
  );
}
