import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import useSoundEffect from '@/hooks/useSoundEffect';
import { ContentTypeEnum } from './configData';
import BeautyGuideImageDialog from './BeautyGuideImageDialog';
import { Button, BgImage } from '@/UI/Components/Base';
import {
  CollectionSceneUIConfig,
  CollectionSceneOtherKey,
  Scene,
  CollectionInfo,
  contentListItem,
} from '@/Core/UIConfigTypes';
import { parseStyleArg } from '@/Core/parser/utils';
import {
  ButtonItem,
  ContainerItem
} from '@/Core/UIConfigTypes';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

import styles from './BeautyGuideDetail.module.scss';
import FlvPlayer from '../FlvPlayer';
import FlvJs from 'flv.js';


type Item = ButtonItem | ContainerItem;
interface IProps {
  info: CollectionInfo | null;
  infoItemStyle: React.CSSProperties | null;
  detailRightDescBgStyle: Item;
  infoTextStyle: React.CSSProperties | null;
}

type alignType = 'column' | 'column-reverse';

const BeautyGuideDetail: FC<IProps> = (props: IProps) => {
  const dispatch = useDispatch();
  const { playSeClick, playSeEnter } = useSoundEffect();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const [currentContent, setCurrentContent] = useState<contentListItem | null>(null); // 当前内容区域
  const [dialogImg, setDialogImg] = useState<string>(''); // 弹窗图片
  const videoPlayerRef = React.useRef<FlvJs.FlvPlayer>(null);

  const [thumbnailData, setThumbnailData] = useState<contentListItem[]>([]);


  const collectionUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.collection],
  ) as CollectionSceneUIConfig;

  useEffect(() => {
    const infoData = props.info as CollectionInfo;
    if (infoData?.contentList && infoData?.contentList?.length > 0) {
      setThumbnailData(infoData.contentList)
      setCurrentContent(infoData.contentList[0]);
    } else {
     const style = collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_thumbnail_bg]?.args?.style ?? {}
      // 缩略图占位 thumbnailItem
      const element: contentListItem[] = []
      const imgUrl = style?.image ? assetSetter(style.image, fileType.background) : ''
      for (let index = 0; index < 5; index++) {
        element.push({
          key: 'placeholder',
          type: 'placeholder',
          url: imgUrl
        }) 
      }
      setThumbnailData(element)
    }
    // if (props.detailRightDescBgStyle) {
    //   if (props.detailRightDescBgStyle?.args?.style) {
    //     const style = props.detailRightDescBgStyle?.args?.style;
    //     // console.log(style);

    //     if (style?.alignPosition?.includes('top')) {
    //       setAlignDirection('column-reverse')
    //       setAlignContent('flex-start')
    //     }
    //   }
    // }
  }, [props]);

  /**
   *  返回
   */
  const handleGoback = () => {
    playSeClick();
    dispatch(
      setVisibility({
        component: 'showBeautyGuideDetail',
        visibility: false,
      }),
    );
  };

  /**
   * 打开图片二级弹窗
   */
  const handleImageDialogOpen = (imgUrl: string) => {
    playSeClick();
    setDialogImg(imgUrl);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
    dispatch(
      setVisibility({
        component: 'showBeautyGuideImageDialog',
        visibility: true,
      }),
    );
  };

  const getInfoText = (id: string, text?: string) => {
    if (typeof text !== 'string' || text === '' ) return null
    const textElement = document.getElementById(`${id}`)
    if (textElement) return textElement.innerHTML = text;
  }

  return (
    <>
      <div className={styles.beautyGuideDetail_main}>
        <BgImage
          item={collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_bg]}
          defaultClass={styles.beautyGuide_detail_bg}
        />
        <Button
          item={collectionUIConfigs.buttons.Collection_back_button}
          defaultClass={`
            ${styles.goback} 
            ${collectionUIConfigs.buttons.Collection_back_button?.args?.style?.image ? styles.hideDefalutGobackBg : ''} 
            interactive`
          }
          onClick={handleGoback}
          onMouseEnter={playSeEnter}
        />
        <div className={styles.beautyGuideDetail_left}>
          <div 
            className={styles.left_box}
            style={
              parseStyleArg(collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_left_bg]?.args?.style)
            }
          >
            <BgImage
              item={collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_left_bg]}
              defaultClass={styles.beautyGuide_detail_left_bg}
            />
          
            <div className={styles.pictureUrl}>
              <img src={props.info?.image} alt="" />
            </div>
            <div className={styles.personal_info}>
              <h3 className={styles.name} style={props?.infoItemStyle ?? {}}>
                {props.info?.name ?? ''}
              </h3>

              <div className={styles.info} style={props?.infoTextStyle ?? {}}>
                <span>身高</span>
                <span>{props.info?.height ?? ''}</span>
              </div>

              <div className={styles.info} style={props?.infoTextStyle ?? {}}>
                <span>体重</span>
                <span>{props.info?.weight ?? ''}</span>
              </div>

              <div className={styles.info} style={props?.infoTextStyle ?? {}}>
                <span>胸围</span>
                <span>{props.info?.bustSize ?? ''}</span>
              </div>

              <div className={styles.info} style={props?.infoTextStyle ?? {}}>
                <span>腰围</span>
                <span>{props.info?.waistSize ?? ''}</span>
              </div>

              <div className={styles.info} style={props?.infoTextStyle ?? {}}>
                <span>臀围</span>
                <span>{props.info?.hipSize ?? ''}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.beautyGuideDetail_right}>
          <div 
            className={
              `${styles.desc_text} 
              ${collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_desc_bg]?.args?.style.image ? styles.hideBgc : ''}`
            }
            style={
              {
                ...parseStyleArg(collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_desc_bg]?.args?.style),
                display: 
                  collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_desc_bg]?.args?.hide 
                    ? 'none' : 'flex'
              }
            }
          >
            <BgImage
              item={collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_desc_bg]}
              defaultClass={styles.desc_bg}
            />
            <span id='info_description'>{getInfoText('info_description', props.info?.description)}</span>
          </div>

          <div 
            className={styles.contentWrapper}
            style={{ display: 
              collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_content_bg]?.args?.hide 
              ? 'none' : 'block'
            }}
          >
            <div 
              // className={styles.content}
              className={
                `${styles.content} 
                ${collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_content_bg]?.args?.style.image ? styles.hideBgc : ''}`
              }
              style={
                parseStyleArg(collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_content_bg]?.args?.style)
              }
            >
              <BgImage
                item={collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_content_bg]}
                defaultClass={styles.content_bg}
              />
              {currentContent && (
                <>
                  {currentContent.type === 'video' && (
                    <FlvPlayer
                      videoPlayerRef={videoPlayerRef}
                      url={currentContent.url}
                      controls
                      autoPlay={!GUIState.showBeautyGuideImageDialog}
                      loop
                      muted
                      key={currentContent.url}
                    />
                  )}

                  {currentContent.type === 'image' && (
                    <img
                      className={`${styles.content_img} interactive`}
                      src={currentContent.url}
                      onClick={() => {
                        handleImageDialogOpen(currentContent.url);
                      }}
                    />
                  )}
                </>
              )}
            </div>
            <div className={styles.thumbnailWrapper}>
              <div>
                {thumbnailData?.map((item: contentListItem, index: number) => {
                  const thumbnailStyleObj = collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_thumbnail_bg]?.args?.style ?? {};
                  let backgroundImage; // 如果有自定义图片，则使用自定义图片
                  let backgroundRepeat;
                  if (thumbnailStyleObj?.customImage) {
                    backgroundImage = `url(${assetSetter(thumbnailStyleObj.customImage, fileType.ui)})`;
                    backgroundRepeat = 'no-repeat';
                  }

                  return (
                    <div
                      key={`thumbnail-${index}`}
                      className={styles.thumbnail_box}
                      style={{
                        ...parseStyleArg(thumbnailStyleObj),
                        backgroundImage,
                        backgroundRepeat
                      }}
                      onClick={() => {
                        if (item.type === ContentTypeEnum.Placeholder) return
                        setCurrentContent(item);
                      }}
                    >
                      {item.type === ContentTypeEnum.Placeholder && <img src={item.url} alt="" />}
                      {item.type === ContentTypeEnum.Image && <img src={item.url} alt="" />}
                      {item.type === ContentTypeEnum.Video && <FlvPlayer url={item.url} controls={false} loop muted />}
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
                            <path
                              fill="#e6e6e6"
                              d="M315.453793 986.509241Q405.963034 1024 512 1024t196.546207-37.490759q90.509241-37.490759 165.490759-112.463448 74.981517-74.990345 112.472275-165.499586Q1024 618.036966 1024 512t-37.490759-196.546207q-37.490759-90.509241-112.463448-165.490759-74.990345-74.981517-165.499586-112.472275Q618.036966 0 512 0T315.453793 37.490759q-90.509241 37.490759-165.490759 112.463448-74.981517 74.990345-112.472275 165.499586Q0 405.963034 0 512t37.490759 196.546207q37.490759 90.518069 112.463448 165.490759 74.981517 74.981517 165.490759 112.472275z m365.982897-65.447724Q603.409655 953.37931 512 953.37931q-91.409655 0-169.43669-32.317793-78.035862-32.317793-142.66262-96.962207-64.644414-64.635586-96.962207-142.653793Q70.62069 603.400828 70.62069 512t32.317793-169.43669q32.317793-78.027034 96.962207-142.66262 64.635586-64.635586 142.653793-96.962207Q420.599172 70.62069 512 70.62069t169.43669 32.308965v0.008828q78.027034 32.317793 142.66262 96.962207 64.635586 64.635586 96.962207 142.653793Q953.37931 420.599172 953.37931 512t-32.317793 169.43669q-32.317793 78.027034-96.962207 142.66262-64.635586 64.644414-142.653793 96.962207h-0.008827z m-249.979587-650.504827l282.394483 221.007448a25.864828 25.864828 0 0 1 0 40.871724l-282.394483 221.016276c-17.390345 13.594483-43.04331 1.412414-43.04331-20.44469V290.992552c0-21.865931 25.661793-34.048 43.04331-20.44469z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                }) ?? null}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {GUIState.showBeautyGuideImageDialog && (
        <BeautyGuideImageDialog
          imgUrl={dialogImg}
          contentList={thumbnailData || []}
          show={GUIState.showBeautyGuideImageDialog}
        />
      )}
    </>
  );
};

export default BeautyGuideDetail;
