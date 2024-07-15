import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import BeautyGuideDetail from './BeautyGuideDetail';
import { IPersonalInfo, personalInfoList } from './configData'
import styles from './beautyGuide.module.scss';


/**
 * 美女图鉴页面
 * @constructor
 */
export const BeautyGuide: FC = () => {
    const dispatch = useDispatch();
    const GUIState = useSelector((state: RootState) => state.GUI);
    const { playSeClick, playSeEnter } = useSoundEffect();
    const [ personalInfo, setPersonalInfo] = useState<IPersonalInfo | null>(null)


    /**
     *  返回
     */
    const handleGoback = () => {
        playSeClick();
        setPersonalInfo(null)
        dispatch(
            setVisibility({ 
                component: 'showBeautyGuide', 
                visibility: false 
            })
        );
    }

    /**
     * 进入详情页
     */
    const handleDetail = (infoData: IPersonalInfo) => {
        playSeClick()
        setPersonalInfo(infoData)
        dispatch(
            setVisibility({ 
                component: 'showBeautyGuideDetail', 
                visibility: true 
            })
        );
    }

    return (
       <>
        {GUIState.showBeautyGuide && (
            <div className={styles.beautyGuide_main}>
                <div className={styles.beautyGuide_header}>
                    <span 
                        className={styles.goback} 
                        onClick={handleGoback} 
                        onMouseEnter={playSeEnter}
                    ></span>
                    <span className={styles.title}>美女图鉴</span>
                </div>
                <div className={styles.beautyGuide_content}>
                    {personalInfoList.map((item: IPersonalInfo, index: number) => (
                        <div 
                            key={`${item.name}$-${index}`}
                            className={styles.item} 
                            onClick={() => handleDetail(item)} 
                            onMouseEnter={playSeEnter}
                        >
                            <img src={item.pictureUrl} />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {GUIState.showBeautyGuideDetail && (
            <BeautyGuideDetail 
                info={personalInfo}
            />
        )}
       </>
    )

}