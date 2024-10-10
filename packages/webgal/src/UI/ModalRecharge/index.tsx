import { useEffect, useRef, useState } from 'react';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { WebGAL } from '@/Core/WebGAL';
import { buyGame, getRechargeList, getRechargeStatus, recharge } from '@/services/store';
import { IRechargeItem } from '@/services/storeInterface';
import { apiPaymantEvent } from '@/services/eventData';
import { chunk } from 'lodash';
import StarStoneIcon from '@/assets/imgs/xingshiIcon.webp';
import ModalClose from '@/assets/imgs/modal-close.png';
import { getLocalDate } from '@/utils/date';

import styles from './modalRecharge.module.scss';
import { SourceImg } from '../Components/SourceImg';

export function ModalRecharge() {
  const [visible, setVisible] = useState(false);
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const { gameInfo } = useSelector((state: RootState) => state.storeData);
  const callbackRef = useRef({
    successCallback: () => {},
    closeCallback: () => {},
  });
  const [rechargeList, setRechargeList] = useState<IRechargeItem[][]>([]);
  const [selectedItem, setSelectedItem] = useState<IRechargeItem>();
  const clickedTimeRef = useRef(0);

  const checkPayStatus = async (orderNo: string) => {
    const res = await getRechargeStatus(orderNo);

    if (res.code === 0) {
      if (res.data?.pay_status === 2) {
        // @ts-ignore
        window.pubsub.publish('toaster', { show: true, text: '充值成功' });
        // @ts-ignore
        window.pubsub.publish('loading', { loading: false });
        callbackRef.current.successCallback();
        setVisible(false);
      } else if (res.data?.pay_status === 3) {
        // @ts-ignore
        window.pubsub.publish('toaster', { show: true, text: '超时未支付，请重试' });
        // @ts-ignore
        window.pubsub.publish('loading', { loading: false });
        setVisible(false);
      } else {
        setTimeout(() => {
          checkPayStatus(orderNo);
        }, 3000);
      }
    } else {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: res.message });
      // @ts-ignore
      window.pubsub.publish('loading', { loading: false });
      setVisible(false);
    }
  };

  const rechargeStoneStar = async () => {
    playSeEnter();
    // @ts-ignore
    window.pubsub.publish('loading', { loading: true });
    const res = await recharge(selectedItem?.id || 0);
    if (res.code === 0) {
      const orderNo = res.data.order_no;
      checkPayStatus(orderNo);

      /** 支付埋点  */
      const params = {
        thirdUserId: sessionStorage.getItem('sdk-userId') as string,
        productId: WebGAL.gameId + '',
        amount: selectedItem?.price ?? 0,
        payTime: getLocalDate(),
      }
      apiPaymantEvent(params)
    } else {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: res.message });
      // @ts-ignore
      window.pubsub.publish('loading', { loading: false });
    }
  };

  const submitRecharge = async () => {
    playSeClick();
    rechargeStoneStar();
  };

  const fetchRechargeList = async () => {
    // @ts-ignore
    window.pubsub.publish('loading', { loading: true });
    const res = await getRechargeList();
    if (res.code === 0) {
      setRechargeList(chunk(res.data || [], 3));
      setSelectedItem(res.data?.[0]);
    } else {
      // @ts-ignore
      window.pubsub.publish('toaster', { show: true, text: res.message });
    }
    // @ts-ignore
    window.pubsub.publish('loading', { loading: false });
  };

  useEffect(() => {
    // @ts-ignore
    const dispose = window.pubsub.subscribe('rechargeModal', ({ successCallback, closeCallback }) => {
      setVisible(true);
      fetchRechargeList();
      if (successCallback) {
        callbackRef.current.successCallback = successCallback;
      }
      if (closeCallback) {
        callbackRef.current.closeCallback = closeCallback;
      }
    });

    return dispose;
  }, []);

  if (!visible) return null;

  if (!rechargeList.length) return null;

  return (
    <div className={styles.Recharge_container}>
      <div className={styles.Recharge_inner}>
        <div className={styles.RechargeModal_modalTitle}>
          <div>余额不足请，充值</div>
        </div>
        <SourceImg
          src={ModalClose}
          className={styles.Recharge_modal_close}
          onMouseEnter={playSeEnter}
          onMouseDown={(e) => {
            const node = e.currentTarget as HTMLDivElement;
            node.className = `${styles.Recharge_modal_close} btn-clicked`;
            clickedTimeRef.current = Date.now();
          }}
          onMouseUp={(e) => {
            const duration = Date.now() - clickedTimeRef.current;
            let node = e.currentTarget;

            setTimeout(
              () => {
                node.className = styles.Recharge_modal_close;
                // @ts-ignore
                node = null;

                setTimeout(() => {
                  playSeClick();
                  setVisible(false);
                  callbackRef.current.closeCallback();
                }, 320);
              },
              duration - 350 > 0 ? 0 : 350 - duration,
            );
          }}
        />
        <div className={styles.RechargeModal_rechargeModalCard}>
          {rechargeList.map((list, i) => (
            <div className={styles.RechargeModal_rechargeModalList} key={i}>
              {list.map((item, j) => (
                <div
                  key={j}
                  className={`${styles.RechargeModal_rechargeModalItem} ${
                    item === selectedItem ? styles.RechargeModal_rechargeModalItemChecked : ''
                  } interactive`}
                  onMouseEnter={playSeEnter}
                  onClick={() => {
                    playSeClick();
                    setSelectedItem(item);
                  }}
                >
                  <div className={styles.RechargeModal_rechargeCardIcon} />
                  {!!item.discount && (
                    <div className={styles.RechargeModal_rechargeCardDiscount}>
                      <span>{item.discount}</span>折
                    </div>
                  )}
                  <div className={styles.RechargeModal_rechargeModalItemHead}>
                    <div>
                      {item.bonus_packs_title}
                      <img src={StarStoneIcon} alt="" />
                      {item.bonus_packs_num}
                    </div>
                  </div>
                  <div className={styles.RechargeModal_rechargeModalItemContent}>
                    <img
                      src={item.icon || 'http://dummyimage.com/100x100'}
                      alt=""
                      className={styles.RechargeModal_rechargeModalItemImg}
                    />
                    <div>
                      <span>X</span> {item.beans}
                    </div>
                  </div>
                  <div className={styles.RechargeModal_rechargeModalItemBtn}>
                    <span>$</span>
                    {item.price}
                  </div>
                </div>
              ))}
              <div className={styles.RechargeModal_rechargeModalListBottom} />
            </div>
          ))}
        </div>
        <div className={styles.RechargeModal_modalFooter}>
          <div className={styles.RechargeModal_modalFooterLeft}>虚拟商品，一经售出不子退款</div>
          <div className={styles.RechargeModal_modalFooterRight}>
            <span>支付${selectedItem?.price}</span>
            <div
              className={styles.RechargeModal_modalFooterConfirm}
              onMouseEnter={playSeEnter}
              onMouseDown={(e) => {
                const node = e.currentTarget as HTMLDivElement;
                node.className = `${styles.RechargeModal_modalFooterConfirm} btn-clicked`;
                clickedTimeRef.current = Date.now();
              }}
              onMouseUp={(e) => {
                const duration = Date.now() - clickedTimeRef.current;
                let node = e.currentTarget;

                setTimeout(
                  () => {
                    node.className = styles.RechargeModal_modalFooterConfirm;
                    // @ts-ignore
                    node = null;

                    setTimeout(submitRecharge, 320);
                  },
                  duration - 350 > 0 ? 0 : 350 - duration,
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
