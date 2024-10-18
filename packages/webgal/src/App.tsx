import Title from '@/UI/Title/Title';
import Logo from '@/UI/Logo/Logo';
import { useEffect, useRef, useState } from 'react';
import { initializeScript, initClickAnimation } from './Core/initializeScript';
import { initGCPSDK, initSdkLink, reportData } from './Core/initGCPSDK';
import { platform_getGameDetail, platform_getUserInfo } from '@/Core/platformMessage';
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
import { setToken } from './store/userDataReducer';
import { setGameInfo, setIsEditorPreviewMode, setUserInfo } from './store/storeReducer';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { Toaster } from './UI/Toaster/Toaster';
import { ModalBuyGame } from './UI/ModalBuyGame/ModalBuyGame';
import { ModalRecharge } from './UI/ModalRecharge';
import { ProgressAchievement } from '@/UI/ProgressAchievement/ProgressAchievement';
import { RootState, webgalStore } from './store/store';
import { Affinity } from './UI/Affinity/Affinity';
import { LogPaySuccess } from '@/Core/log';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const GUIState = useSelector((state: RootState) => state.GUI);
  // @ts-ignore
  const isCurrentPageInIframe = window.self !== window.top;
  const refObject = useRef({
    gameReady: false,
    previewMode: false,
    previewModeValue: false,
  });
  const callCheckCallbackTimer = useRef<ReturnType<typeof setTimeout> | null>();

  const loadGameDetail = (token: string) => {
    // 平台-iframe
    if (isCurrentPageInIframe) {
      platform_getGameDetail();
      return;
    }
    const gameId = new URLSearchParams(window.location.search).get('gameId');
    // @ts-ignore
    window.globalThis.getGameDetail(gameId, token).then((res: any) => {
      // @ts-ignore
      window.pubsub.publish('gameInfoReady', true);
      webgalStore.dispatch(setGameInfo(res.data));
      reportData(res.data);
    });
  };

  const checkCallback = (token: string) => {
    // 轮询游戏是否ready & 预览模式
    if (!refObject.current.gameReady && !refObject.current.previewMode) {
      callCheckCallbackTimer.current = setTimeout(() => {
        checkCallback(token);
      }, 100);

      return;
    }

    if (callCheckCallbackTimer.current) {
      clearTimeout(callCheckCallbackTimer.current);
      callCheckCallbackTimer.current = null;
    }

    /**
     * 启动Pixi
     */
    WebGAL.gameplay.pixiStage = new PixiStage();
    // 本地编辑器会走这个条件
    if (refObject.current.previewModeValue) {
      // @ts-ignore
      window.pubsub.publish('gameInfoReady', true);
    } else {
      loadGameDetail(token);
    }
  };

  const initLoginInfo = (token?: any) => {
    setLoggedIn(true);
    dispatch(setToken(token || ''));

    checkCallback(token);
  };

  const platform_init = () => {
    window.addEventListener('message', (message: any) => {
      const data = message.data;
      const { method, status, response } = data.data;
      if (!method) return;
      if (method === 'IS_CAN_START') {
        // @ts-ignore
        if (status) window.MessageSaveFunc();
      }
      if (method === 'GET_USER_INFO') {
        webgalStore.dispatch(setUserInfo(response.data));
        sessionStorage.setItem('sdk-userId', response.data.userId);
        initLoginInfo();
      }
      if (method === 'GET_GAME_DETAIL') {
        // @ts-ignore
        window.pubsub.publish('gameInfoReady', true);
        webgalStore.dispatch(setGameInfo(response.data));
        reportData(response.data);
      }
      if (method === 'BUY_GAME') {
        const gameInfo = webgalStore.getState().storeData.gameInfo;
        // @ts-ignore
        LogPaySuccess({ paymentAmount: gameInfo.paymentAmount });
        if (WebGAL.isFinishTrial === '0') {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // @ts-ignore
          window.MessageSaveFunc();
        }
      }
    });
    // 登录
    platform_getUserInfo();
  };

  const isPlatIframe = () => {
    const isPreviewMode = webgalStore.getState().storeData.isEditorPreviewMode;
    return isCurrentPageInIframe && !isPreviewMode;
  };

  const sdk_init = () => {
    initGCPSDK();
    const token = sessionStorage.getItem('sdk-token');
    if (token) {
      initLoginInfo(token);
      return;
    }
    // @ts-ignore
    // const is_terre = window?.top[0]?.origin.indexOf('localhost') > -1;
    // if (is_terre) return;
    setTimeout(() => {
      // @ts-ignore
      window.globalThis.openLoginDialog().then((res) => {
        initLoginInfo(res.token);
        sessionStorage.setItem('sdk-token', res.token);
        sessionStorage.setItem('sdk-userId', res.userId);
        window.location.reload();
      });
    }, 1000);
  };

  useEffect(() => {
    const bool = isPlatIframe();
    if (bool) return;
    initSdkLink(() => {
      sdk_init();
    });
  }, [WebGAL.gameJsLink, WebGAL.gameCssLink]);

  useEffect(() => {
    setTimeout(() => {
      initClickAnimation();
      initializeScript();
    }, 1000);

    // @ts-ignore 从websocket接口查询是否连接到编辑器，value为true时表示已连接, 视为预览模式
    const dispose = window.pubsub.subscribe('isPreviewMode', (value) => {
      refObject.current.previewMode = true;
      refObject.current.previewModeValue = value;
      dispatch(setIsEditorPreviewMode(value));

      // 在iframe中且不是编辑器预览模式
      if (isCurrentPageInIframe && !value) {
        platform_init();
        return;
      }

      // 在编辑器预览中
      // if (value) {
      //   const token = localStorage.getItem('editor-token');
      //   initLoginInfo(token);
      //   return;
      // }

      dispose();
    });

    // @ts-ignore
    const dispose2 = window.pubsub.subscribe('gameReady', () => {
      refObject.current.gameReady = true;
      dispose2();
    });
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
