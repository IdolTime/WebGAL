import { assetSetter, fileType } from '../../util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '../scene/sceneFetcher';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { webgalStore } from '@/store/store';
import { setVisibility, setShowStoryLine } from '@/store/GUIReducer';
import { sceneNameType } from '@/Core/Modules/scene';
import { sceneParser } from '@/Core/parser/sceneParser';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { setStage, stageActions, setAchieveBg } from '@/store/stageReducer';

/**
 * 进入故事线页面
 */
export const enterStoryLine = async () => {
    // 重新获取初始场景
    const sceneUrl: string = assetSetter(sceneNameType.Storyline, fileType.scene);
    WebGAL.sceneManager.resetScene();

    // 场景写入到运行时
    const rawScene = await sceneFetcher(sceneUrl);
    const scene = await WebGAL.sceneManager.setCurrentScene(rawScene, sceneNameType.Storyline, sceneUrl);
    //@ts-ignore
    if (scene?.sentenceList?.length > 0) {
        //@ts-ignore
        const sentence = scene.sentenceList[0];
       
        if (sentence.commandRaw === 'changeBg') {
            webgalStore.dispatch(setStage({ key: 'storyLineBg', value: sentence?.content ?? '' }));
            sentence?.args?.forEach((arg: { key: string; value: number }) => {
              if (arg?.key === 'x') {
                webgalStore.dispatch(setStage({ key: 'storyLineBgX', value: arg?.value }));
              } else if (arg?.key === 'y') {
                webgalStore.dispatch(setStage({ key: 'storyLineBgY', value: arg?.value }));
              }
            });
          }

        // 开始第一条语句
        nextSentence();
    }
    
    // webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
    webgalStore.dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
    webgalStore.dispatch(setVisibility({ component: 'showTextBox', visibility: false }));
    webgalStore.dispatch(setShowStoryLine(true));
}