import Title from '@/UI/Title/Title';
import Logo from '@/UI/Logo/Logo';
import { useEffect, useState } from 'react';
import { initializeScript } from './Core/initializeScript';
import Menu from '@/UI/Menu/Menu';
import { Stage } from '@/Stage/Stage';
import { BottomControlPanel } from '@/UI/BottomControlPanel/BottomControlPanel';
import { Backlog } from '@/UI/Backlog/Backlog';
import { Extra } from '@/UI/Extra/Extra';
import { BottomControlPanelFilm } from '@/UI/BottomControlPanel/BottomControlPanelFilm';
import GlobalDialog from '@/UI/GlobalDialog/GlobalDialog';
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
import { useDispatch } from 'react-redux';
import { setToken } from './store/userDataReducer';
import { getPaymentConfigList } from './services/store';
import { setPaymentConfigurationList } from './store/storeReducer';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { Toaster } from './UI/Toaster/Toaster';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    initializeScript();
    const token = localStorage.getItem('editor-token');
    const tokenFromQuery = new URLSearchParams(window.location.search).get('token');
    if (tokenFromQuery) {
      setLoggedIn(true);
      dispatch(setToken(tokenFromQuery || ''));
      // @ts-ignore
      window.pubsub.subscribe('gameReady', () => {
        /**
         * 启动Pixi
         */
        WebGAL.gameplay.pixiStage = new PixiStage();
        getPaymentConfigList();
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
      <Toaster />
      <Loading />
      <Translation />
      <Stage />
      <GameMenuPanel />
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
      <StoryLine />
      <Achievement />
      <BeautyGuide />
      <ModalR18 />
    </div>
  );
}

export default App;
