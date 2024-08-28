import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useSetBg } from '@/Stage/MainStage/useSetBg';
import { useSetFigure } from '@/Stage/MainStage/useSetFigure';
import { useSetPopUpImage } from '@/Stage/MainStage/useSetPopUpImage';
import { setStageObjectEffects } from '@/Stage/MainStage/useSetEffects';

export function MainStage() {
  const stageState = useSelector((state: RootState) => state.stage);
  useSetBg(stageState);
  useSetFigure(stageState);
  useSetPopUpImage(stageState);
  setStageObjectEffects(stageState);
  return <div style={{ display: 'none' }} />;
}
