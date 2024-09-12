import { FC, useState, useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import BeautyGuideDetail from './BeautyGuideDetail';
import {
  CollectionSceneUIConfig,
  CollectionSceneOtherKey,
  Scene,
  CollectionInfoItem,
  CollectionInfo,
  contentListItem,
} from '@/Core/UIConfigTypes';
import { Button, BgImage } from '@/UI/Components/Base';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { parseStyleArg, parseImagesArg, parseVideosArg } from '@/Core/parser/utils';
import { px2 } from '@/Core/parser/utils';

import styles from './beautyGuide.module.scss';

/**
 * 美女图鉴页面
 * @constructor
 */
export const BeautyGuide: FC = () => {
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const { playSeClick, playSeEnter } = useSoundEffect();
  const [personalInfo, setPersonalInfo] = useState<CollectionInfo | null>(null);

  const collectionUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.collection],
  ) as CollectionSceneUIConfig;

  const [collectionList, setCollectionList] = useState<Array<CollectionInfo>>([]);
  const [detailsStyle, setDetailsStyle] = useState<Record<string, CSSProperties>>({});
  const [currentDetailStyle, setCurrentDetailStyle] = useState<CSSProperties | null>(null);
  const [detailsInfoStyle, setDetailsInfoStyle] = useState<Record<string, CSSProperties>>({});
  const [imgStyle, setImgStyle] = useState<Record<string, CSSProperties>>({});
  const [infoTextStyle, setInfoTextStyle] = useState<CSSProperties | null>({});


  useEffect(() => {
    if (GUIState.showBeautyGuide) {
      const list: CollectionInfo[] = [];
      const others = collectionUIConfigs?.other ?? {};
      const styleObj = {};
      const styleInfoStyle = {};
      let index = 1;

      Object.entries(others).forEach(([key, infoVal]) => {
        if (key?.includes('Collection_img')) {
          const info = (infoVal as CollectionInfoItem)?.args?.info as CollectionInfo;
          let style = (infoVal as CollectionInfoItem)?.args?.style ?? {};
          const images = (infoVal as CollectionInfoItem)?.args?.images;
          const videos = (infoVal as CollectionInfoItem)?.args?.videos;

          // @ts-ignore
          styleInfoStyle[`Collection_img_info${index}`] = {
            color: style?.customColor,
            fontSize: style?.customFontSize ? `${px2(style.customFontSize)}px` : '',
          };
          // @ts-ignore
          style = parseStyleArg(style) as CSSProperties;
          // @ts-ignore
          const contentList: contentListItem[] = parseImagesArg(images);
          const videoList = parseVideosArg(videos);

          const img = info?.image && assetSetter(info?.image, fileType.ui) || '';
          const avatarImg = infoVal?.args?.style?.image && assetSetter(infoVal?.args?.style?.image, fileType.ui) || '';

          list.push({
            avatar: avatarImg,
            name: info?.name,
            image: img,
            height: info?.height,
            weight: info?.weight,
            bustSize: info?.bustSize,
            waistSize: info?.waistSize,
            hipSize: info?.hipSize,
            description: info?.description ?? '',
            contentList: videoList.concat(contentList),
          });
          // @ts-ignore
          styleObj[`Collection_img${index}`] = style;
          index++;
        }
      });

      setDetailsInfoStyle(styleInfoStyle)
      setDetailsStyle(styleObj);
      setImgStyle(styleObj)
      setCollectionList(list);
    }
  }, [GUIState.showBeautyGuide]);

  /**
   *  返回
   */
  const handleGoback = () => {
    playSeClick();
    setPersonalInfo(null);
    setInfoTextStyle({})
    dispatch(
      setVisibility({
        component: 'showBeautyGuide',
        visibility: false,
      }),
    );
  };

  /**
   * 进入详情页
   */
  const handleDetail = (infoData: CollectionInfo, index: number) => {
    playSeClick();
    setPersonalInfo(infoData);
    setCurrentDetailStyle(detailsStyle[`Collection_img${index + 1}`]);
    setInfoTextStyle(detailsInfoStyle[`Collection_img_info${index + 1}`])
    dispatch(
      setVisibility({
        component: 'showBeautyGuideDetail',
        visibility: true,
      }),
    );
  };

  return (
    <>
      {GUIState.showBeautyGuide && (
        <div className={styles.beautyGuide_main}>
          <BgImage
            item={collectionUIConfigs.other[CollectionSceneOtherKey.Collection_bg]}
            defaultClass={styles.beautyGuide_bg}
          />

          <div className={styles.beautyGuide_header}>
            <Button
              item={collectionUIConfigs.buttons.Collection_back_button}
              defaultClass={`${styles.goback} interactive`}
              onClick={handleGoback}
              onMouseEnter={playSeEnter}
            />
            <Button item={collectionUIConfigs.other.Collection_title} defaultClass={styles.title} />
          </div>
          <div className={styles.beautyGuide_content}>
            {collectionList.map((item: CollectionInfo, index: number) => {
              if (!item?.avatar) return null;
              return (
                <div
                  key={`${item?.name}$-${index}`}
                  className={`${styles.item} interactive`}
                  onClick={() => handleDetail(item, index)}
                  onMouseEnter={playSeEnter}
                >
                  <img src={item.avatar} style={imgStyle[`Collection_img${index + 1}`]} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {GUIState.showBeautyGuideDetail && 
        <BeautyGuideDetail 
          info={personalInfo} 
          infoItemStyle={currentDetailStyle} 
          infoTextStyle={infoTextStyle}
          detailRightDescBgStyle={
            collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_right_desc_bg]
          }
        />
      }
    </>
  );
};
