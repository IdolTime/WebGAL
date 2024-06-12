import styles from './panicOverlay.module.scss';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const PanicOverlay = () => {
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const [showOverlay, setShowOverlay] = useState(false);
  useEffect(() => {
    setShowOverlay(GUIStore.showPanicOverlay);
  }, [GUIStore.showPanicOverlay]);
  return null;
};
