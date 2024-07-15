import { FC, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import useSoundEffect from '@/hooks/useSoundEffect';
import { IPersonalInfo, IContent, ContentTypeEnum } from './configData'
import BeautyGuideImageDialog from './BeautyGuideImageDialog';
import styles from './BeautyGuideDetail.module.scss'


interface IProps {
    info: IPersonalInfo | null
}

const BeautyGuideDetail: FC<IProps> = (props: IProps) => {
    const dispatch = useDispatch();
    const { playSeClick, playSeEnter } = useSoundEffect();
    const GUIState = useSelector((state: RootState) => state.GUI);
    const [currentContent, setCurrentContent] = useState<IContent | null>(null); // 当前内容区域
    const [dialogImg, setDialogImg] = useState<string>(''); // 弹窗图片 

    useEffect(() => {
        const infoData = props.info as IPersonalInfo;
        if (infoData?.contentList && infoData?.contentList?.length > 0) {
            setCurrentContent(infoData.contentList[0]);
        }
    }, [props])

    const imgList = useMemo(() => {
        let list: IContent[] = []
        const infoData = props.info as IPersonalInfo;
        if (infoData?.contentList && infoData?.contentList?.length > 0) {
            list = infoData.contentList.filter(f => f.type === ContentTypeEnum.Image)
        }

        return list 
    }, [])

    /**
     *  返回
     */
    const handleGoback = () => {
        playSeClick();
        dispatch(
            setVisibility({
                component: 'showBeautyGuideDetail',
                visibility: false
            })
        );
    }

    /**
     * 打开图片二级弹窗
     */
    const handleImageDialogOpen = (imgUrl: string) => {
        playSeClick();
        setDialogImg(imgUrl)
        dispatch(
            setVisibility({
                component: 'showBeautyGuideImageDialog',
                visibility: true
            })
        );
    }

    return (
        <>
            <div className={styles.beautyGuideDetail_main}>
                <div className={styles.beautyGuideDetail_left}>
                    <div className={styles.header}>
                        <span
                            className={styles.goback}
                            onClick={handleGoback}
                            onMouseEnter={playSeEnter}
                        ></span>
                        <span className={styles.title}>个人档案馆</span>
                    </div>
                    <div className={styles.pictureUrl}>
                        <img src={props.info?.pictureUrl ?? ''} alt="" />
                    </div>
                    <div className={styles.personal_info}>

                        <h3 className={styles.name}>
                            {props.info?.name ?? ''}
                        </h3>

                        <div className={styles.info}>
                            <span>身高</span>
                            <span>{props.info?.height ?? '-'}</span>
                        </div>

                        <div className={styles.info}>
                            <span>体重</span>
                            <span>{props.info?.weight ?? '-'}</span>
                        </div>

                        <div className={styles.info}>
                            <span>胸围</span>
                            <span>{props.info?.bustSize ?? '-'}</span>
                        </div>

                        <div className={styles.info}>
                            <span>腰围</span>
                            <span>{props.info?.waistSize ?? '-'}</span>
                        </div>

                        <div className={styles.info}>
                            <span>臀围</span>
                            <span>{props.info?.hipSize ?? '-'}</span>
                        </div>

                    </div>
                </div>
                <div className={styles.beautyGuideDetail_right}>
                    <div className={styles.contentWrapper}>
                        <div className={styles.content}>
                            {currentContent && (
                                <>
                                    {currentContent.type === 'video' && (
                                        <video controls autoPlay loop muted key={currentContent.url}>
                                            <source src={currentContent.url} type="video/mp4"></source>
                                        </video>
                                    )}

                                    {currentContent.type === 'image' && (
                                        <img
                                            className={styles.content_img}
                                            src={currentContent.url}
                                            onClick={() => {
                                                handleImageDialogOpen(currentContent.url)
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                        <div className={styles.thumbnailWrapper}>
                            <div>
                                {props.info?.contentList?.map((item: IContent, index: number) => {
                                    return (
                                        <div
                                            key={`thumbnail-${index}`}
                                            className={styles.thumbnail_box}
                                            onClick={() => {
                                                setCurrentContent(item)
                                            }}
                                        >
                                            <img src={item.thumbnailUrl} alt="" />
                                            {item.type === ContentTypeEnum.Video && (
                                                <div className={styles.video_mark}>
                                                   <svg 
                                                        viewBox="0 0 1024 1024" 
                                                        version="1.1" 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        p-id="4276" 
                                                        width="48" 
                                                        height="48"
                                                    >
                                                        <path fill="#e6e6e6" d="M315.453793 986.509241Q405.963034 1024 512 1024t196.546207-37.490759q90.509241-37.490759 165.490759-112.463448 74.981517-74.990345 112.472275-165.499586Q1024 618.036966 1024 512t-37.490759-196.546207q-37.490759-90.509241-112.463448-165.490759-74.990345-74.981517-165.499586-112.472275Q618.036966 0 512 0T315.453793 37.490759q-90.509241 37.490759-165.490759 112.463448-74.981517 74.990345-112.472275 165.499586Q0 405.963034 0 512t37.490759 196.546207q37.490759 90.518069 112.463448 165.490759 74.981517 74.981517 165.490759 112.472275z m365.982897-65.447724Q603.409655 953.37931 512 953.37931q-91.409655 0-169.43669-32.317793-78.035862-32.317793-142.66262-96.962207-64.644414-64.635586-96.962207-142.653793Q70.62069 603.400828 70.62069 512t32.317793-169.43669q32.317793-78.027034 96.962207-142.66262 64.635586-64.635586 142.653793-96.962207Q420.599172 70.62069 512 70.62069t169.43669 32.308965v0.008828q78.027034 32.317793 142.66262 96.962207 64.635586 64.635586 96.962207 142.653793Q953.37931 420.599172 953.37931 512t-32.317793 169.43669q-32.317793 78.027034-96.962207 142.66262-64.635586 64.644414-142.653793 96.962207h-0.008827z m-249.979587-650.504827l282.394483 221.007448a25.864828 25.864828 0 0 1 0 40.871724l-282.394483 221.016276c-17.390345 13.594483-43.04331 1.412414-43.04331-20.44469V290.992552c0-21.865931 25.661793-34.048 43.04331-20.44469z">
                                                        </path>
                                                   </svg>
                                                </div>
                                            )}
                                        </div>
                                    )
                                }) ?? null}
                            </div>
                        </div>
                    </div>
                    <div className={styles.desc_text}>
                        <span>{props.info?.description ?? ''}</span>
                    </div>
                </div>
            </div>

            {GUIState.showBeautyGuideImageDialog && (
                <BeautyGuideImageDialog imgUrl={dialogImg} imgList={imgList} />
            )}
        </>
    )
}

export default BeautyGuideDetail