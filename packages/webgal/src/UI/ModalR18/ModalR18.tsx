import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setGameR18 } from '@/store/GUIReducer';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import R18png from '@/assets/imgs/r18.png'
import styles from './ModalR18.module.scss';

export const ModalR18: FC = () => {
    const t = useTrans('r18.');
    const dispatch = useDispatch();
    const GUIStore = useSelector((state: RootState) => state.GUI);
    const { playSeClick, playSeEnter } = useSoundEffect();

    const handleAgree = () => {
        playSeClick()
        dispatch(setGameR18(false));
    }

    const handleDisagree = () => {
        playSeClick()
        window.location.href = '/'
    }

    return (
        <>
            {GUIStore.isShowR18Modal && GUIStore.openR18Modal && (
                  <div className={styles.modalR18_main}>
                    <div className={styles.mark}></div>
                    <div className={styles.modalR18_container}>

                        <div className={styles.content}>
                            <img src={R18png} alt="R18.png" />
                            <h3 className={styles.title}>{t('title')}</h3>
                            <span className={styles.desc}>{t('desction')}</span>
                        </div>
                        
                        <div className={styles.foolter}>
                            <span 
                                className={styles.btn} 
                                onClick={handleAgree} 
                                onMouseEnter={playSeEnter}
                            >
                                {t('agree')}
                            </span>
                            <span 
                                className={styles.btn}
                                onClick={handleDisagree} 
                                onMouseEnter={playSeEnter}
                            >
                                {t('disagree')}
                            </span>
                        </div>
                    </div>
                  </div>
            )}
        </>
    )
}