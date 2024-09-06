import { setStage } from '@/store/stageReducer';

import page_flip_1 from '@/assets/se/page-flip-1.mp3';
import switch_1 from '@/assets/se/switch-1.mp3';
import mouse_enter from '@/assets/se/mouse-enter.mp3';
import dialog_se from '@/assets/se/dialog.mp3';
import click_se from '@/assets/se/click.mp3';
import { useDispatch, useSelector } from 'react-redux';
import { webgalStore, RootState } from '@/store/store';
import { IScound, EnumScoundType } from '@/store/stageInterface';

/**
 * 调用音效
 */
const useSoundEffect = () => {
  const dispatch = useDispatch();
  const stageStore = useSelector((state: RootState) => state.stage);

  const playSeEnter = () => {
    // 游戏内音效
    // if (stageStore.gameScounds?.length > 0) {
    //   const item = stageStore.gameScounds.find((item: IScound) => item.key === EnumScoundType.Move);
    //   if (typeof item?.value === 'boolean') {
    //     dispatch(setStage({ key: 'gameSe', value: '' }));
    //   } else {
    //     dispatch(setStage({ key: 'gameSe', value: item?.value || mouse_enter }));
    //   }
    // } else {
    //   dispatch(setStage({ key: 'gameSe', value: mouse_enter }));
    // }
    // 菜单内音效
    // if (stageStore.menuScounds?.length > 0) {
    //   const item = stageStore.menuScounds.find((item: IScound) => item.key === EnumScoundType.Move);
    //   if (typeof item?.value === 'boolean') {
    //     dispatch(setStage({ key: 'uiSe', value: '' }));
    //   } else {
    //     dispatch(setStage({ key: 'uiSe', value: item?.value || mouse_enter }));
    //   }
    // } else {
    //   dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
    // }

    dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
  };
  const playSeClick = (customSe?: string) => {
    dispatch(setStage({ key: 'uiSe', value: customSe || click_se }));
    dispatch(setStage({ key: 'hasCustomClickSe', value: true }));
  };
  const playSeSwitch = () => {
    dispatch(setStage({ key: 'uiSe', value: switch_1 }));
  };
  const playSePageChange = () => {
    dispatch(setStage({ key: 'uiSe', value: page_flip_1 }));
  };

  const playSeDialogOpen = () => {
    dispatch(setStage({ key: 'uiSe', value: dialog_se }));
  };

  return {
    playSeEnter,
    playSeClick,
    playSePageChange,
    playSeDialogOpen,
    playSeSwitch,
  };
};

/**
 * 调用音效（只供 choose.tsx 使用）
 */
export const useSEByWebgalStore = () => {
  const playSeEnter = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
  };
  const playSeClick = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: click_se }));
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};

export default useSoundEffect;
