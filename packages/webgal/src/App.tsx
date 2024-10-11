import Title from '@/UI/Title/Title';
import Logo from '@/UI/Logo/Logo';
import { useEffect, useState } from 'react';
import { initClickAnimation, initializeScript } from './Core/initializeScript';
import Menu from '@/UI/Menu/Menu';
import { Stage } from '@/Stage/Stage';
import { BottomControlPanel } from '@/UI/BottomControlPanel/BottomControlPanel';
import { Backlog } from '@/UI/Backlog/Backlog';
import { Extra } from '@/UI/Extra/Extra';
import { BottomControlPanelFilm } from '@/UI/BottomControlPanel/BottomControlPanelFilm';
import GlobalDialog, { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import DevPanel from '@/UI/DevPanel/DevPanel';
import Translation from '@/UI/Translation/Translation';
import { PanicOverlay } from '@/UI/PanicOverlay/PanicOverlay';
import { useFullScreen } from './hooks/useFullScreen';
import { GameMenuPanel } from './UI/GameMenuPanel/GameMenuPanel';
import { Loading } from '@/UI/Loading/Loading';
import StoryLine from '@/UI/StoryLine/StoryLine';
import { Achievement } from '@/UI/Achievement';
import { BeautyGuide } from '@/UI/BeautyGuide/BeautyGuide';
import { ModalR18 } from '@/UI/ModalR18/ModalR18';
import { useDispatch, useSelector } from 'react-redux';
import { setToken, setUserInfo } from './store/userDataReducer';
import { getEditorGameDetail, getGameInfo, getPaymentConfigList } from './services/store';
import { setIsEditorPreviewMode } from './store/storeReducer';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { Toaster } from './UI/Toaster/Toaster';
import { ModalBuyGame } from './UI/ModalBuyGame/ModalBuyGame';
import { ModalRecharge } from './UI/ModalRecharge';
import { ProgressAchievement } from '@/UI/ProgressAchievement/ProgressAchievement';
import { RootState, webgalStore } from './store/store';
import { Affinity } from './UI/Affinity/Affinity';
import { getUserInfo } from './services/user';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);

  useEffect(() => {
    initClickAnimation();
    initializeScript();
    const token = localStorage.getItem('editor-token');
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = queryParams.get('token');
    const channel = queryParams.get('channel') || '0';
    WebGAL.channel = channel;
    if (tokenFromQuery || token) {
      setLoggedIn(true);
      dispatch(setToken(tokenFromQuery || ''));
      let refObject = {
        current: {
          gameReady: false,
          previewMode: false,
          previewModeValue: false,
        },
      };
      const checkCallback = () => {
        if (refObject.current.gameReady && !refObject.current.previewMode) return;
        /**
         * 启动Pixi
         */
        WebGAL.gameplay.pixiStage = new PixiStage();
        if (refObject.current.previewModeValue) {
          getEditorGameDetail().then((res) => {
            const authorInfoStr = localStorage.getItem('editorUserInfo') || '{}';
            const authorInfo = JSON.parse(authorInfoStr);
            webgalStore.dispatch(setUserInfo(authorInfo));

            // @ts-ignore
            window.pubsub.publish('gameInfoReady', true);

            if (res.code === 0) {
              if (res.data.authorId !== authorInfo.userId) {
                // dispatch(setIsEditorPreviewMode(false));
                // setLoggedIn(false);
                // alert('不可预览非本人的游戏');
                // return;
              }
            }
          });
        } else {
          Promise.all([getGameInfo(), getUserInfo()]).then(([res1, res2]) => {
            if (res1.code === 0 && res2.code === 0) {
              // @ts-ignore
              window.pubsub.publish('gameInfoReady', true);
            } else {
              // @ts-ignore
              window.pubsub.publish('gameInfoReady', false);
              showGlogalDialog({
                title: res1.code !== 0 ? '获取游戏信息失败\n请稍后重试！' : '获取用户信息失败\n请稍后重试！',
                rightText: '确定',
                rightFunc: () => {
                  window.location.reload();
                },
              });
            }
          });
          getPaymentConfigList();
        }
      };
      // @ts-ignore
      window.pubsub.subscribe('gameReady', () => {
        refObject.current.gameReady = true;
        checkCallback();
      });

      // @ts-ignore
      window.pubsub.subscribe('isPreviewMode', (value) => {
        refObject.current.previewMode = true;
        refObject.current.previewModeValue = value;
        dispatch(setIsEditorPreviewMode(value));
        checkCallback();
      });
    } else {
      alert('请先登录');
    }
  }, []);

  useFullScreen();

  if (!loggedIn) return null;

  // Provider用于对各组件提供状态
  return (
    <div className="App">
      <ModalRecharge />
      <ModalBuyGame />
      <Toaster />
      <Loading />
      <Translation />
      <Stage />
      <BottomControlPanel />
      <BottomControlPanelFilm />
      <Backlog />
      <Title />
      <Logo />
      <Extra />
      <Menu />
      <GlobalDialog />
      <PanicOverlay />
      <DevPanel />
      {!GUIState.showProgressAndAchievement && <StoryLine />}
      {!GUIState.showProgressAndAchievement && <Achievement />}
      <BeautyGuide />
      <ModalR18 />
      <GameMenuPanel />
      <ProgressAchievement />
      {!GUIState.showProgressAndAchievement && <Affinity />}
    </div>
  );
}

export default App;
