import { FC, useEffect } from 'react';
import styles from '../SaveAndLoad.module.scss';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { setStorage } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSavesFromCloud, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { setVisibility } from '@/store/GUIReducer';
import { px2 } from '@/Core/parser/utils';
import { LoadSceneUIConfig, Scene } from '@/Core/UIConfigTypes';
import { Button } from '@/UI/Components/Base';
import { WebGAL } from '@/Core/WebGAL';

export const Save: FC = () => {
  const { playSeClick, playSePageChange, playSeEnter, playSeDialogOpen } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const savesDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const page = [];
  const GUIState = useSelector((state: RootState) => state.GUI);
  const LoadUIConfigs = GUIState.gameUIConfigs[Scene.load] as LoadSceneUIConfig;

  for (let i = 1; i <= 4; i++) {
    const element = (
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          playSePageChange();
        }}
        onMouseEnter={playSeEnter}
        key={'Load_element_page' + i}
        className={`${styles.Save_Load_top_button} interactive`}
      >
        <div
          className={
            i === userDataState.optionData.slPage
              ? styles.Save_Load_indicator_active
              : styles.Save_Load_indicator_default
          }
        />
      </div>
    );
    page.push(element);
  }

  const tCommon = useTrans('common.');

  const showSaves = [];
  // 现在尝试设置6个存档每页
  const start = (userDataState.optionData.slPage - 1) * 6 + 1;
  const end = start + 5;

  useEffect(() => {
    getSavesFromCloud(2);
  }, []);

  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = savesDataState.saveData[i];
    let saveElementContent = <div className={styles.Save_Load_content_ele} />;
    if (saveData) {
      saveElementContent = (
        <>
          <div className={styles.Save_Load_bg} />
          <div className={styles.Save_Load_border} />
          <img className={styles.Save_Load_content_miniRen_bg} alt="Save_img_preview" src={saveData.previewImage} />
          <div className={styles.Save_Load_info}>
            {saveData.saveTime}
            <br />
            <span
              style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: px2(300),
              }}
            >
              {saveData.nowStageState.showText}
            </span>
          </div>
        </>
      );
    }
    const saveElement = (
      <div
        onClick={() => {
          if (savesDataState.saveData[i]) {
            playSeDialogOpen();
            showGlogalDialog({
              title: t('saving.isOverwrite'),
              leftText: tCommon('no'),
              rightText: tCommon('yes'),
              leftFunc: () => {},
              rightFunc: () => {
                saveGame(i);
              },
            });
          } else {
            playSePageChange();
            saveGame(i);
          }
        }}
        onMouseEnter={playSeEnter}
        key={'saveElement_' + i}
        className={`${styles.Save_Load_content_element} interactive`}
        style={{ animationDelay: `${animationIndex * 30}ms` }}
      >
        {saveElementContent}
      </div>
    );
    showSaves.push(saveElement);
  }

  const t = useTrans('menu.');

  const handleBtnClick = (dir: string) => {
    const slPage = userDataState.optionData.slPage;
    let index = slPage;
    if (dir === 'left') {
      index = index > 1 ? index - 1 : 4;
    } else {
      index = index < 4 ? index + 1 : 1;
    }
    dispatch(setSlPage(index));
    setStorage();
    playSePageChange();
  };

  return (
    <div className={styles.Save_Load_main}>
      <Button
        item={LoadUIConfigs.buttons.Load_back_button}
        defaultClass={`${styles.Common_back} interactive`}
        onClick={() => {
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
          WebGAL.videoManager.resumePausedVideo();
        }}
        onMouseEnter={playSeEnter}
      />
      <div className={`${styles.Common_title} ${styles.Save_title}`} />
      <div className={styles.Save_Load_content} id={'Save_content_page_' + userDataState.optionData.slPage}>
        {showSaves}
      </div>
      <div className={styles.Save_Load_top_buttonList}>
        <div
          className={`${styles.Btn} interactive`}
          onMouseEnter={playSeEnter}
          onClick={() => handleBtnClick('left')}
        />
        <div className={styles.Save_Load_indicator_container}>{page}</div>
        <div
          className={`${styles.Btn} ${styles.Btn_r} interactive`}
          onMouseEnter={playSeEnter}
          onClick={() => handleBtnClick('right')}
        />
      </div>
    </div>
  );
};
