import React, { FC, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setShowStoryLine } from '@/store/GUIReducer';
import { ISaveStoryLineData, ISaveData, ISaveAffinity } from '@/store/userDataInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { getStorylineFromStorage, getUnlockAffinityFromStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2 } from '@/Core/parser/utils';
import { AffinitySceneOtherKey, AffinitySceneUIConfig, Scene, StorylineSceneUIConfig } from '@/Core/UIConfigTypes';
import { BgImage, Button, CustomContainer } from '../Components/Base';

import styles from './affinity.module.scss';
import { ExtraContainer } from '@/Stage/extraContainer';
import { SourceImg } from '../Components/SourceImg';

/**
 * 好感度页面
 * @constructor
 */
export const Affinity: FC = () => {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const unlockAffinityList = useSelector((state: RootState) => state.saveData.unlockAffinityData);
  const affinityUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.affinity],
  ) as AffinitySceneUIConfig;

  useEffect(() => {
    if (GUIState.showAffinity) {
      getUnlockAffinityFromStorage();
    }
  }, [GUIState.showAffinity]);

  /**
   * 返回
   */
  const handlGoBack = () => {
    backToTitle();
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
          <Button item={affinityUIConfigs.other[AffinitySceneOtherKey.Affinity_title]} />
          <BgImage item={affinityUIConfigs.other[AffinitySceneOtherKey.Affinity_bg]} defaultClass={styles.affinityBg} />
          {unlockAffinityList?.map((item: ISaveAffinity, index) => {
            const { name, url, x, y, isUnlocked } = item;

            if (!isUnlocked) {
              return null;
            }

            return (
              <SourceImg
                key={index}
                src={assetSetter(url, fileType.ui)}
                alt={name}
                style={{ position: 'absolute', left: px2(x), top: px2(y) }}
              />
            );
          })}
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
