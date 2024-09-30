import { assetSetter, fileType } from '../../util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '../scene/sceneFetcher';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { webgalStore } from '@/store/store';
import { setVisibility, setShowStoryLine } from '@/store/GUIReducer';
import { sceneNameType } from '@/Core/Modules/scene';

/**
 * 进入故事线页面
 */
export const enterStoryLine = async () => {
  // 重新获取初始场景
  const sceneUrl: string = assetSetter(sceneNameType.Storyline, fileType.scene);
  WebGAL.sceneManager.resetScene();

  // 场景写入到运行时
  const rawScene = await sceneFetcher(sceneUrl);
  webgalStore.dispatch(setShowStoryLine(true));
  // webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  await WebGAL.sceneManager.setCurrentScene(rawScene, sceneNameType.Storyline, sceneUrl);

  nextSentence();
  webgalStore.dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  webgalStore.dispatch(setVisibility({ component: 'showTextBox', visibility: false }));
};

/**
 * 进入好感度页面
 */
export const enterAffinity = async () => {
  // 重新获取初始场景
  const sceneUrl: string = assetSetter(sceneNameType.Affinity, fileType.scene);
  WebGAL.sceneManager.resetScene();

  // 场景写入到运行时
  const rawScene = await sceneFetcher(sceneUrl);
  webgalStore.dispatch(setVisibility({ component: 'showAffinity', visibility: true }));
  // webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  await WebGAL.sceneManager.setCurrentScene(rawScene, sceneNameType.Affinity, sceneUrl);

  nextSentence();
  webgalStore.dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
  webgalStore.dispatch(setVisibility({ component: 'showTextBox', visibility: false }));
};
