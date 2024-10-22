import { CSSProperties, FC, useEffect, useState } from 'react';
import { loadGame } from '@/Core/controller/storage/loadGame';
import styles from '@/UI/Menu/SaveAndLoad/SaveAndLoad.module.scss';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setshowFavorited } from '@/store/GUIReducer';
import { setSlPage } from '@/store/userDataReducer';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import EditNameDialog from './EditNameDialog';
import { ISaveData } from '@/store/userDataInterface';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { setVisibility } from '@/store/GUIReducer';
import { saveActions } from '@/store/savesReducer';
import { ExtraSceneOtherKey, ExtraSceneUIConfig, Scene } from '@/Core/UIConfigTypes';
import { Button, Indicator } from '../Components/Base';
import { parseStyleArg } from '@/Core/parser/utils';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';

let editNameVal = '';
let editNameIndex = 0;

export const ExtraVideo: FC = () => {
  const t = useTrans('menu.');
  const dispatch = useDispatch();
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const extraUIConfigs = useSelector((state: RootState) => 
    state.GUI.gameUIConfigs[Scene.extra]) as ExtraSceneUIConfig;

  const { playSeClick, playSeEnter, playSePageChange } = useSoundEffect();
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [currentPageACtive, setCurrentPageACtive] = useState<number>(userDataState.optionData.slPage);

  const gapObj: CSSProperties = {}
  const page = [];
  const showSaves = [];
  // 现在尝试设置10个存档每页
  const start = (userDataState.optionData.slPage - 1) * 10 + 1;
  const end = start + 9;

  useEffect(() => {
    getSavesFromStorage(start, end);
  }, [start, end]);

  // 修改名称
  const handleEditName = (e: any, saveData: ISaveData, index: number) => {
    e.stopPropagation();
    editNameVal = saveData.saveName || saveData.saveTime;
    editNameIndex = index;
    setTimeout(() => {
      setShowEditDialog(true);
    }, 100);
  };

  const onCancel = () => {
    setShowEditDialog(false);
    editNameVal = '';
  };

  const onConfirm = (newName: string) => {
    editNameVal = '';
    saveGame(editNameIndex, newName, true);
    setStorage();
    setShowEditDialog(false);
  };

  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = saveDataState.saveData[i];
    let saveElementContent = <div />;

    // 已解锁元素
    const unlockedItem = extraUIConfigs.other[ExtraSceneOtherKey.Extra_bgm_unlocked_item]
    // 未解锁元素
    const item = extraUIConfigs.other[ExtraSceneOtherKey.Extra_bgm_locked_item_bg]

    // 已解锁元素 文字
    // const unlockedItem = extraUIConfigs.other[ExtraSceneOtherKey.Extra_bgm_unlocked_item]

    const unlockedItemStyle: CSSProperties = parseStyleArg(unlockedItem.args.style);
    let styleObj: CSSProperties = parseStyleArg(item.args.style);

   

    if (styleObj?.columnGap) {
      //@ts-ignore
      gapObj.columnGap = styleObj.columnGap
    }

    if (styleObj?.rowGap) {
      //@ts-ignore
      gapObj.rowGap = styleObj.rowGap
    }

    const unlockedSrcBg = unlockedItem.args.style?.image || '';
    const itemSrcBg = item.args.style?.image || '';

    if (itemSrcBg) {
      styleObj.backgroundImage = `url(${assetSetter(itemSrcBg, fileType.ui)})`;
      styleObj.backgroundSize = '100% 100%';
      styleObj.backgroundRepeat = 'no-repeat';
    }


    if (saveData && unlockedSrcBg) {
      unlockedItemStyle.backgroundImage = `url(${assetSetter(unlockedSrcBg, fileType.ui)})`;
      unlockedItemStyle.backgroundSize = '100% 100%';
      unlockedItemStyle.backgroundRepeat = 'no-repeat';
    }


    if (saveData) {
      if (unlockedItem?.args?.hide) {
        saveElementContent = <div />
      } else {

        styleObj = {
          ...styleObj,
          ...unlockedItemStyle
        }

        saveElementContent = (
          <>
            <div className={styles.Save_Load_content_element_top}>
              <div className={styles.Save_Load_content_element_top_index + ' ' + styles.Load_content_elememt_top_index}>
                {saveData.index}
              </div>
            </div>
            <div className={styles.Save_Load_content_miniRen}>
              <img className={styles.Save_Load_content_miniRen_bg} alt="Save_img_preview" src={saveData.previewImage} />
            </div>
            <div>
              <div
                className={styles.Save_Load_content_element_top_date + ' ' + styles.Load_content_element_top_date}
                style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                onClick={(e) => handleEditName(e, saveData, i)}
                title={`${saveData.saveName || saveData.saveTime}`}
              >
                {saveData.saveName || saveData.saveTime}
              </div>
            </div>
          </>
        );
      }
    }

    if (!item.args.hide) {

      const saveElement = (
        <div
          onClick={() => {
            dispatch(setshowFavorited(true));
            dispatch(setVisibility({ component: 'isInGaming', visibility: true }));
            loadGame(i, true);
            playSeClick();
          }}
          onMouseEnter={playSeEnter}
          key={'loadElement_' + i}
          className={`${styles.Save_Load_content_element} interactive`}
          style={{ animationDelay: `${animationIndex * 30}ms`, ...styleObj }}
        >
          {saveElementContent}
        </div>
      );
      showSaves.push(saveElement);
    }
  }

  const handleGoBack = () => {
    playSeClick();
    dispatch(setVisibility({ component: 'showExtra', visibility: false }));
    dispatch(saveActions.setLoadVideo(false));
    dispatch(saveActions.setSaveStatus({ key: 'prevPlayVideo', value: '' }));
    backToTitle()
  };

  return (
    <>
      <Button
        item={extraUIConfigs.buttons.Extra_back_button}
        defaultClass={`
          ${styles.goback} 
          ${styles.extraVideo_goback} 
          ${extraUIConfigs.buttons.Extra_back_button?.args?.style?.image ? styles.hideDefalutGobackBg : ''}
          interactive`
        }
        onClick={handleGoBack}
        onMouseEnter={playSeEnter}
      />
      <Button
        item={extraUIConfigs.other[ExtraSceneOtherKey.Extra_title]}
        defaultClass={`${styles.Save_Load_title} ${styles.extra_video_title}`}
        defaultTextClass={styles.Load_title_text}
        defaultText={t('extra.title')}
      />

      <Indicator
        isExtraIndicator={true}
        isShowNumber={true}
        item={extraUIConfigs.other[ExtraSceneOtherKey.Extra_indicator]}
        activeIndex={currentPageACtive}
        defaultClass={`${styles.Save_Load_top_buttonList} ${styles.extra_video_top_buttonList} interactive`}
        pageLength={20}
        indicatorDefaultClass={`${styles.Save_Load_top_button} ${styles.Load_top_button} interactive`}
        activeIndecatorClass={`${styles.Save_Load_top_button_on} ${styles.Load_top_button_on}`}
        onClickIndicator={(i) => {
          dispatch(setSlPage(i));
          setCurrentPageACtive(i);
          setStorage();
          playSePageChange();
        }}
        onClickPrev={() => {
          if (userDataState.optionData.slPage <= 1) return
          setCurrentPageACtive(userDataState.optionData.slPage - 1);
          dispatch(setSlPage(userDataState.optionData.slPage - 1));
          setStorage();
          playSePageChange();
        }}
        onClickNext={() => {
          if (userDataState.optionData.slPage >= 20) return
          setCurrentPageACtive(userDataState.optionData.slPage + 1);
          dispatch(setSlPage(userDataState.optionData.slPage + 1));
          setStorage();
          playSePageChange();
        }}
      />

      <div className={`${styles.Save_Load_main} ${styles.extra_video_main}`}>
        <div 
          className={styles.Save_Load_content} 
          id={'Load_content_page_' + userDataState.optionData.slPage}
          style={gapObj}
        >
          {showSaves}
        </div>
      </div>

      {showEditDialog && ( 
        <EditNameDialog 
          value={editNameVal} 
          onCancel={onCancel} 
          onConfirm={onConfirm} 
        />
      )}
    </>
  );
};
