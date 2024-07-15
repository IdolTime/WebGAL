import { assetSetter, fileType } from '../../util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '../scene/sceneFetcher';
import { WebGAL } from '@/Core/WebGAL';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { saveActions } from '@/store/savesReducer'

/**
 * 进入美女图鉴页面
 */
export const enterBeautyGuide = () => {
    webgalStore.dispatch(
        setVisibility({ 
            component: 'showBeautyGuide', 
            visibility: true 
        })
    );
}