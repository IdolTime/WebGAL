import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setShowStoryLine } from '@/store/GUIReducer';
import { ISaveStoryLineData, ISaveData } from '@/store/userDataInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { getStorylineFromStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2 } from '@/Core/parser/utils';
import { AffinitySceneOtherKey, AffinitySceneUIConfig, Scene, StorylineSceneUIConfig } from '@/Core/UIConfigTypes';
import { BgImage, Button, CustomContainer } from '../Components/Base';

import styles from './affinity.module.scss';
import { ExtraContainer } from '@/Stage/extraContainer';

/**
 * 好感度页面
 * @constructor
 */
export const Affinity: FC = () => {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const affinityUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.affinity],
  ) as AffinitySceneUIConfig;

  useEffect(() => {
    getStorylineFromStorage();
    if (GUIState.showStoryLine) {
      dispatch(saveActions.setShowStoryline(false));
    }
  }, [GUIState.showStoryLine]);

  /**
   * 返回
   */
  const handlGoBack = () => {
    playSeClick();
    backToTitle();
    dispatch(setShowStoryLine(false));
  };

  return (
    <>
      {GUIState.showAffinity && (
        <div className={styles.affinity}>
          <Button
            item={affinityUIConfigs.buttons.Affinity_back_button}
            defaultClass={styles.goBack}
            onClick={handlGoBack}
            onMouseEnter={playSeEnter}
          />
          <Button
            item={affinityUIConfigs.other[AffinitySceneOtherKey.Affinity_title]}
            onClick={handlGoBack}
            onMouseEnter={playSeEnter}
          />
          <BgImage item={affinityUIConfigs.other[AffinitySceneOtherKey.Affinity_bg]} defaultClass={styles.affinityBg} />
          <ExtraContainer />
          {/* <CustomContainer
            item={affinityUIConfigs.other[AffinitySceneOtherKey.Affinity_item_container]}
            defaultClass={styles.affinityList}
            id="affinity-item-list"
          /> */}
        </div>
      )}
    </>
  );
};
