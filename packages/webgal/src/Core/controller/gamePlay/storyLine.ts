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
export const enterStoryLine = () => {
    
    // 重新获取初始场景
    const sceneUrl: string = assetSetter(sceneNameType.Storyline, fileType.scene);
    WebGAL.sceneManager.resetScene();

    // 场景写入到运行时
    sceneFetcher(sceneUrl).then((rawScene) => {
        WebGAL.sceneManager.setCurrentScene(rawScene, sceneNameType.Storyline, sceneUrl).then((scene) => {
        if (scene) {
            // 开始第一条语句
            nextSentence();
        }
        });
    });
    
    webgalStore.dispatch(setVisibility({ component: 'showTitle', visibility: false }));
    webgalStore.dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
    webgalStore.dispatch(setVisibility({ component: 'showTextBox', visibility: false }));
    webgalStore.dispatch(setShowStoryLine(true));
}