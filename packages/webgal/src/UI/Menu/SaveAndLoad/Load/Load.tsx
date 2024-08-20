import { CSSProperties, FC, useEffect, useState } from 'react';
import { loadGame } from '@/Core/controller/storage/loadGame';
import styles from '../SaveAndLoad.module.scss';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { setVisibility } from '@/store/GUIReducer';
import { LoadSceneUIConfig, ButtonItem, IndicatorContainerItem, Scene } from '@/Core/UIConfigTypes';
import { Iargs } from './loadInterface'
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2 } from '@/Core/parser/utils';


interface ISetBgStyle {
  hasDisplay?: boolean;
  id?: string;
  imgType?: fileType;
}

export const Load: FC = () => {
  const dispatch = useDispatch();
  const { playSeClick, playSeEnter, playSePageChange } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const loadUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.load] as LoadSceneUIConfig
  );


  const page = [];
  for (let i = 1; i <= 20; i++) {
    let classNameOfElement = styles.Save_Load_top_button + ' ' + styles.Load_top_button;
    if (i === userDataState.optionData.slPage) {
      classNameOfElement = classNameOfElement + ' ' + styles.Save_Load_top_button_on + ' ' + styles.Load_top_button_on;
    }
    const element = (
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          setStorage();
          playSePageChange();
        }}
        onMouseEnter={playSeEnter}
        key={'Load_element_page' + i}
        className={classNameOfElement}
      >
        <div 
          className={styles.Save_Load_top_button_text}
          style={
            setBgStyle(
              loadUIConfigs?.other?.Load_indicator as IndicatorContainerItem, 
              { hasDisplay: false, imgType: fileType.ui}
            )
          }>{i}</div>
      </div>
    );
    page.push(element);
  }

  const showSaves = [];
  // 现在尝试设置10个存档每页
  const start = (userDataState.optionData.slPage - 1) * 10 + 1;
  const end = start + 9;

  useEffect(() => {
    getSavesFromStorage(start, end);
  }, [start, end]);

  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = saveDataState.saveData[i];
    let saveElementContent = <div />;
    if (saveData) {
      const speaker = saveData.nowStageState.showName === '' ? '\u00A0' : `${saveData.nowStageState.showName}`;
      saveElementContent = (
        <>
          <div className={styles.Save_Load_content_element_top}>
            <div className={styles.Save_Load_content_element_top_index + ' ' + styles.Load_content_elememt_top_index}>
              {saveData.index}
            </div>
            <div className={styles.Save_Load_content_element_top_date + ' ' + styles.Load_content_element_top_date}>
              {saveData.saveTime}
            </div>
          </div>
          <div className={styles.Save_Load_content_miniRen}>
            <img className={styles.Save_Load_content_miniRen_bg} alt="Save_img_preview" src={saveData.previewImage} />
          </div>
          <div className={styles.Save_Load_content_text}>
            <div className={styles.Save_Load_content_speaker + ' ' + styles.Load_content_speaker}>{speaker}</div>
            <div className={styles.Save_Load_content_text_padding}>{saveData.nowStageState.showText}</div>
          </div>
        </>
      );
    }
    // else {

    // }
    const saveElement = (
      <div
        onClick={() => {
          loadGame(i);
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
        key={'loadElement_' + i}
        className={styles.Save_Load_content_element}
        style={{ 
          animationDelay: `${animationIndex * 30}ms`,
          ...setBgStyle(
            loadUIConfigs?.other?.Load_locked_item, 
            { hasDisplay: true, imgType: fileType.ui}
          )
        }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  const t = useTrans('menu.');

  const handleGoBack = () => {
    playSeClick();
    dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  }

  function getImgUrl(img: string, type: fileType) {
    return assetSetter(img, type);
  }

  function setBgStyle(
    loadUIConfig:  ButtonItem | IndicatorContainerItem, 
    { 
      hasDisplay = false,
      id = '', 
      imgType
    }: ISetBgStyle
  ) {
    const styleObj: CSSProperties = {}
    const args = loadUIConfig?.args
    if (!args || args?.hide && !hasDisplay) return styleObj

    if (args?.hide && hasDisplay) {
      styleObj['display'] = 'none';
    }

    const style = args.style
    const imageFormatsRegex = /\.(png|jpeg|jpg|webp|icon|fig)$/;

    if (style?.image) {
      if (imageFormatsRegex.test(style.image) && imgType) {
        styleObj['backgroundImage'] = `url(${getImgUrl(style?.image, imgType)})`;
        styleObj['position'] = style.position;
        styleObj['backgroundSize'] = '100% 100%';
        styleObj['backgroundRepeat'] = 'no-repeat';
      } else {
        const ele = document.getElementById(id)
        if (ele) {
          ele.innerText = style?.image;
        }
      }
    }

    if (style?.scale) {
      styleObj['transform'] = `scale(${style.scale})`;
    }

    if (typeof style?.x === 'number') {
      styleObj['top'] = `${px2(style.x)}px`;
    }

    if (typeof style?.y === 'number') {
      styleObj['top'] = `${px2(style.y)}px`;
    }

    if (style?.width) {
      styleObj['width'] = `${px2(style.width)}px`;
    }

    if (style?.height) {
      styleObj['height'] = `${px2(style.height)}px`;
    }

    if (style?.height) {
      styleObj['height'] = `${px2(style.height)}px`;
    }

    if (style?.fontColor) {
      styleObj['color'] = style.fontColor;
    }

    if (style?.fontSize) {
      styleObj['fontSize'] = style.fontSize;
    }

    return styleObj
  }

  return (
    <div 
      className={styles.Save_Load_main}
      style={setBgStyle(loadUIConfigs?.other?.Load_bg, { hasDisplay: false, imgType: fileType.background })}
    >
      <div className={styles.Save_Load_top}>
        <div 
          className={styles.goback}
          style={setBgStyle(loadUIConfigs?.buttons?.Load_back_button, { hasDisplay: true, imgType: fileType.ui })}
          onClick={handleGoBack} 
          onMouseEnter={playSeEnter}
        >{/* 返回 */}</div>
        <div 
          className={styles.Save_Load_title}
          style={
            setBgStyle(
              loadUIConfigs?.other?.Load_title, 
              { hasDisplay: true, id: loadUIConfigs?.other?.Load_title.key }
            )
          }
        >
          <div 
            id={loadUIConfigs?.other?.Load_title.key} 
            className={styles.Load_title_text}
          >
            {t('loadSaving.title')}
          </div>
        </div>
        <div className={styles.Save_Load_top_buttonList}>{page}</div>
      </div>
      <div className={styles.Save_Load_content} id={'Load_content_page_' + userDataState.optionData.slPage}>
        {showSaves}
      </div>
    </div>
  );
};
