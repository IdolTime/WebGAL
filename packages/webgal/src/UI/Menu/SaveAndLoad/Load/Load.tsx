import { FC, useEffect } from 'react';
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

export const Load: FC = () => {
  const { playSeClick, playSeEnter, playSePageChange } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const page = [];
  for (let i = 1; i <= 4; i++) {
    const element = (
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          setStorage();
          playSePageChange();
        }}
        onMouseEnter={playSeEnter}
        key={'Load_element_page' + i}
        className={styles.Save_Load_top_button}
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

  const showSaves = [];
  // 现在尝试设置6个存档每页
  const start = (userDataState.optionData.slPage - 1) * 6 + 1;
  const end = start + 5;

  useEffect(() => {
    getSavesFromStorage(start, end);
  }, [start, end]);

  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = saveDataState.saveData[i];
    let saveElementContent = <div className={styles.Save_Load_content_ele} />;

    if (saveData) {
      saveElementContent = (
        <>
          <div className={styles.Save_Load_bg} />
          <img className={styles.Save_Load_content_miniRen_bg} alt="Save_img_preview" src={saveData.previewImage} />
          <div className={styles.Save_Load_border} />
          <div className={styles.Save_Load_info}>
            {saveData.saveTime}
            {'\n'}
            {saveData.nowStageState.showText}
          </div>
        </>
      );
    }
    const saveElement = (
      <div
        onClick={() => {
          loadGame(i);
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
      <div className={`${styles.Common_title} ${styles.Load_title}`}>
        <div
          className={styles.Common_back}
          onClick={() => {
            playSeClick();
            dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
          }}
          onMouseEnter={playSeEnter}
        />
      </div>
      <div className={styles.Save_Load_content} id={'Load_content_page_' + userDataState.optionData.slPage}>
        {showSaves}
      </div>
      <div className={styles.Save_Load_top_buttonList}>
        <div className={styles.Btn} onMouseEnter={playSeEnter} onClick={() => handleBtnClick('left')} />
        <div className={styles.Save_Load_indicator_container}>{page}</div>
        <div
          className={`${styles.Btn} ${styles.Btn_r}`}
          onMouseEnter={playSeEnter}
          onClick={() => handleBtnClick('right')}
        />
      </div>
    </div>
  );
};
