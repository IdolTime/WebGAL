import { FC, useEffect, useState } from 'react';
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

let editNameVal = '';
let editNameIndex = 0;

export const ExtraVideo: FC = () => {
  const { playSeClick, playSeEnter, playSePageChange } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const page = [];
  const extraUIConfigs = useSelector((state: RootState) => state.GUI.gameUIConfigs[Scene.extra]) as ExtraSceneUIConfig;

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
        <div className={styles.Save_Load_top_button_text}>{i}</div>
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
    saveGame(editNameIndex, newName);
    setStorage();
    setShowEditDialog(false);
  };

  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = saveDataState.saveData[i];
    let saveElementContent = <div />;
    if (saveData) {
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

    const saveElement = (
      <div
        onClick={() => {
          dispatch(setshowFavorited(true));
          loadGame(i, true);
          playSeClick();
        }}
        onMouseEnter={playSeEnter}
        key={'loadElement_' + i}
        className={styles.Save_Load_content_element}
        style={{ animationDelay: `${animationIndex * 30}ms` }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  const t = useTrans('menu.');

  const handleGoBack = () => {
    dispatch(setVisibility({ component: 'showExtra', visibility: false }));
    dispatch(saveActions.setLoadVideo(false));
  };

  return (
    <>
      <Button
        item={extraUIConfigs.buttons.Extra_back_button}
        defaultClass={`${styles.goback} ${styles.extraVideo_goback} interactive`}
        onClick={handleGoBack}
        onMouseEnter={playSeEnter}
      />
      <Button
        item={extraUIConfigs.other[ExtraSceneOtherKey.Extra_title]}
        defaultClass={styles.Save_Load_title}
        defaultTextClass={styles.Load_title_text}
        defaultText={t('extra.title')}
      />
      <div className={styles.Save_Load_main}>
        <Indicator
          item={extraUIConfigs.other[ExtraSceneOtherKey.Extra_indicator]}
          activeIndex={userDataState.optionData.slPage}
          defaultClass={styles.Save_Load_top_buttonList}
          pageLength={20}
          indicatorDefaultClass={`${styles.Save_Load_top_button} ${styles.Load_top_button}`}
          activeIndecatorClass={`${styles.Save_Load_top_button_on} ${styles.Load_top_button_on}`}
          onClickIndicator={(i) => {
            dispatch(setSlPage(i));
            setStorage();
            playSePageChange();
          }}
        />
        <div className={styles.Save_Load_content} id={'Load_content_page_' + userDataState.optionData.slPage}>
          {showSaves}
        </div>
      </div>

      {showEditDialog && <EditNameDialog value={editNameVal} onCancel={onCancel} onConfirm={onConfirm} />}
    </>
  );
};
