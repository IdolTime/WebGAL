import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import useSoundEffect from '@/hooks/useSoundEffect';
import { IPersonalInfo, IContent, ContentTypeEnum } from './configData'
import styles from './BeautyGuideImageDialog.module.scss';


interface IProps {
    imgUrl: string;
    imgList: IContent[]
}

const BeautyGuideImageDialog: FC<IProps> = (props: IProps) => {
    const dispatch = useDispatch();
    const { playSeClick, playSeEnter } = useSoundEffect();
    const [ currentImg, setCurrentImg ] = useState<string>(props?.imgUrl ?? '');
    const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);

    useEffect(() => {
        if (props.imgList?.length > 0) {
            const index = props.imgList.findIndex((item: IContent) => item.url === props.imgUrl);
            if (index > -1) {
                setCurrentImgIndex(index)
            }
        }
    }, [props.imgList])

    /**
     * 关闭对话框
     */
    const handleCloseDialog = () => {
        playSeClick();
        dispatch(
            setVisibility({
                component: 'showBeautyGuideImageDialog',
                visibility: false
            })
        );
    }

    /**
     * 上一张图片
     */
    const handlePrev = () => {
        playSeClick();
        const index = currentImgIndex - 1;
        if (index < 0) {
            return;
        }
        setCurrentImgIndex(index)
        setCurrentImg(props.imgList[index].url)
    }

    /**
     * 下一张图片
     */
    const handleNext = () => {
        playSeClick();
        const index = currentImgIndex + 1;
        if (index > props.imgList.length - 1) {
            return;
        }
        setCurrentImgIndex(index)
        setCurrentImg(props.imgList[index].url)
    }

    return (
        <div className={styles.beautyGuideImageDialog}>
            <div className={styles.mark} onClick={handleCloseDialog}></div>
            <div className={styles.content}>
                <div className={styles.imgWrapper}>
                    {props.imgList && props.imgList.map((img: IContent, index: number) => {
                        if (img.type === ContentTypeEnum.Image && index === currentImgIndex) {
                            return (
                                <img 
                                    key={`img-${index}`} 
                                    src={img.url}
                                    className={styles.transitionImage}
                                />
                            )
                        }
                        return null;
                    })}
                </div>
                
                <div className={styles.btnsWrapper}>
                    <span 
                        className={`${styles.btn} ${currentImgIndex < 1 ? styles.btn_prev_disabled : ''}`} 
                        onMouseEnter={playSeEnter} 
                        onClick={handlePrev}
                    >
                        上一个
                    </span>

                    <span className={styles.btn_txt}>
                        {currentImgIndex + 1}/{props.imgList?.length ?? 0}张截图
                    </span>

                    <span 
                        className={`${styles.btn} ${currentImgIndex + 1 >= props.imgList.length ? styles.btn_next_disabled : ''}`} 
                        onMouseEnter={playSeEnter}
                        onClick={handleNext} 
                    >
                        下一个
                    </span>
                </div>
            </div>
        </div>
    )
}

export default BeautyGuideImageDialog;