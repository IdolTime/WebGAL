import React, { FC, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setShowStoryLine, setVisibility } from '@/store/GUIReducer';
import { ISaveStoryLineData, ISaveData } from '@/store/userDataInterface';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { getStorylineFromStorage } from '@/Core/controller/storage/savesController';
import { saveActions } from '@/store/savesReducer';
import useSoundEffect from '@/hooks/useSoundEffect';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2 } from '@/Core/parser/utils';
import { ProgressSceneOtherKey, ProgressSceneUIConfig, Scene, StorylineSceneUIConfig } from '@/Core/UIConfigTypes';
import { BgImage, Button, CustomContainer } from '../Components/Base';
import { Achievement } from '../Achievement';

import styles from './progressAchievement.module.scss';
import { enterAffinity, enterStoryLine } from '@/Core/controller/gamePlay/enterSubPage';
import { enterAchieve } from '@/Core/controller/achieve/achieve';
import { Affinity } from '../Affinity/Affinity';
import StoryLine from '../StoryLine/StoryLine';

/**
 * 进度与成就页面
 * @constructor
 */
export const ProgressAchievement: FC = () => {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const progressUIConfigs = useSelector(
    (state: RootState) => state.GUI.gameUIConfigs[Scene.progressAndAchievement],
  ) as ProgressSceneUIConfig;
  const [tab, setTab] = useState<'chapter' | 'achievement' | 'affinity'>('chapter');

  /**
   * 返回
   */
  const handlGoBack = () => {
    playSeClick();
    backToTitle();
    dispatch(setVisibility({ component: 'showAffinity', visibility: false }));
    dispatch(setVisibility({ component: 'showProgressAndAchievement', visibility: false }));
    dispatch(setVisibility({ component: 'showAchievement', visibility: false }));
  };

  return (
    <>
      {GUIState.showProgressAndAchievement && (
        <div className={styles.progressAchievement}>
          <BgImage defaultClass={styles.bg} item={progressUIConfigs.other[ProgressSceneOtherKey.Progress_bg]} />
          <Button
            item={progressUIConfigs.buttons.Progress_back_button}
            defaultClass={styles.goBack}
            onClick={handlGoBack}
            onMouseEnter={playSeEnter}
          />
          <Button
            item={progressUIConfigs.buttons.Progress_chapter_button}
            defaultClass={styles.chapterTag}
            type="checkbox"
            checked={tab === 'chapter'}
            onClick={() => {
              enterStoryLine();
              playSeClick();
              setTab('chapter');
            }}
            onMouseEnter={playSeEnter}
          />
          <Button
            item={progressUIConfigs.buttons.Progress_achievement_button}
            defaultClass={styles.achievementTag}
            type="checkbox"
            checked={tab === 'achievement'}
            onClick={() => {
              playSeClick();
              enterAchieve();
              setTab('achievement');
            }}
            onMouseEnter={playSeEnter}
          />
          <Button
            item={progressUIConfigs.buttons.Progress_affinity_button}
            defaultClass={styles.affinityTag}
            type="checkbox"
            checked={tab === 'affinity'}
            onClick={() => {
              playSeClick();
              enterAffinity();
              setTab('affinity');
            }}
            onMouseEnter={playSeEnter}
          />
          <CustomContainer
            defaultClass={styles.contentContainer}
            item={progressUIConfigs.other[ProgressSceneOtherKey.Progress_content_container]}
          >
            {tab === 'chapter' && <StoryLine />}
            {tab === 'achievement' && <Achievement />}
            {tab === 'affinity' && <Affinity />}
          </CustomContainer>
        </div>
      )}
    </>
  );
};
