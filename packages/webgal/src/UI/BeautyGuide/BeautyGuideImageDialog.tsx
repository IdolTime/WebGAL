import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import useSoundEffect from '@/hooks/useSoundEffect';
import { IPersonalInfo, IContent, ContentTypeEnum } from './configData';
import {
  CollectionSceneUIConfig,
  CollectionSceneOtherKey,
  Scene,
  CollectionInfoItem,
  CollectionInfo,
  contentListItem,
} from '@/Core/UIConfigTypes';
import { Button, BgImage } from '@/UI/Components/Base';
import { parseStyleArg, px2 } from '@/Core/parser/utils';

import styles from './BeautyGuideImageDialog.module.scss';
import FlvPlayer from '../FlvPlayer';

interface IProps {
  imgUrl: string;
  contentList: contentListItem[];
  show: boolean;
}

const BeautyGuideImageDialog: FC<IProps> = (props: IProps) => {
  const dispatch = useDispatch();
  const { playSeClick, playSeEnter } = useSoundEffect();
  const [currentImg, setCurrentImg] = useState<string>(props?.imgUrl ?? '');
  const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);
  const [bgStyle, setBgStyle] = useState<React.CSSProperties>({});

  const collectionUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.collection],
  ) as CollectionSceneUIConfig;

  useEffect(() => {
    if (props.contentList?.length > 0) {
      const index = props.contentList.findIndex((item: contentListItem) => item.url === props.imgUrl);
      if (index > -1) {
        setCurrentImgIndex(index);
      }
    }

    if (props.show) {
      const style = parseStyleArg(
        collectionUIConfigs?.other[CollectionSceneOtherKey.Collection_detail_dialog_bg]?.args?.style,
      );
      setBgStyle(style);
    }
  }, [props.contentList, props.show]);

  /**
   * 关闭对话框
   */
  const handleCloseDialog = () => {
    playSeClick();
    dispatch(
      setVisibility({
        component: 'showBeautyGuideImageDialog',
        visibility: false,
      }),
    );
  };

  /**
   * 上一张图片
   */
  const handlePrev = () => {
    playSeClick();
    const index = currentImgIndex - 1;
    if (index < 0) {
      return;
    }
    setCurrentImgIndex(index);
    setCurrentImg(props.contentList[index].url);
  };

  /**
   * 下一张图片
   */
  const handleNext = () => {
    playSeClick();
    const index = currentImgIndex + 1;
    if (index > props.contentList.length - 1) {
      return;
    }
    setCurrentImgIndex(index);
    setCurrentImg(props.contentList[index].url);
  };

  return (
    <div className={styles.beautyGuideImageDialog}>
      <div className={styles.mark} onClick={handleCloseDialog} />
      <div
        className={styles.content}
        style={{
          width: bgStyle?.width ? px2(bgStyle.width) : undefined,
          height: bgStyle?.height ? px2(bgStyle.height) : undefined,
        }}
      >
        <BgImage
          item={collectionUIConfigs.other[CollectionSceneOtherKey.Collection_detail_dialog_bg]}
          defaultClass={styles.content_bg}
        />

        <div className={styles.imgWrapper}>
          {props.contentList?.map((img: contentListItem, index: number) => {
            if (img.type === ContentTypeEnum.Image && index === currentImgIndex) {
              return <img key={`img-${index}`} src={img.url} className={styles.transitionImage} />;
            } else if (img.type === ContentTypeEnum.Video && index === currentImgIndex) {
              return (
                <FlvPlayer url={img.url} key={`img-${index}`} className={styles.transitionImage} muted autoPlay loop />
              );
            }
            return null;
          })}
        </div>

        <div className={styles.btnsWrapper}>
          {/* 上一张 */}
          <Button
            defaultText="上一张"
            item={collectionUIConfigs.buttons.Collection_detail_dialog_prev_button}
            defaultClass={`${styles.btn} 
                            ${currentImgIndex < 1 ? styles.btn_prev_disabled : ''}`}
            onClick={handlePrev}
            onMouseEnter={playSeEnter}
          />

          <span
            className={styles.btn_txt}
            style={
              parseStyleArg(
                collectionUIConfigs?.other[CollectionSceneOtherKey?.Collection_detail_dialog_text]?.args?.style,
              ) ?? {}
            }
          >
            {currentImgIndex + 1}/{props.contentList?.length ?? 0}张截图
          </span>
          {/* 下一张 */}
          <Button
            defaultText="下一张"
            item={collectionUIConfigs.buttons.Collection_detail_dialog_next_button}
            defaultClass={`${styles.btn} 
                            ${currentImgIndex + 1 >= props.contentList.length ? styles.btn_next_disabled : ''}`}
            onClick={handleNext}
            onMouseEnter={playSeEnter}
          />
        </div>
      </div>
    </div>
  );
};

export default BeautyGuideImageDialog;
