import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { PerformController } from '@/Core/Modules/perform/performController';

/**
 * 游戏运行时变量
 */
export class Gameplay {
  public isAuto = false;
  public isFast = false;
  public isSyncingWithOrigine = false;
  public autoInterval: ReturnType<typeof setInterval> | null = null;
  public fastTimeout: ReturnType<typeof setTimeout> | null = null;
  public autoTimeout: ReturnType<typeof setTimeout> | null = null;
  public pixiStage: PixiStage | null = null;
  public performController = new PerformController();
  public resetGamePlay() {
    this.performController.timeoutList = [];
    this.isAuto = false;
    this.isFast = false;
    const autoInterval = this.autoInterval;
    if (autoInterval !== null) clearInterval(autoInterval);
    this.autoInterval = null;
    const fastTimeout = this.fastTimeout;
    if (fastTimeout !== null) clearTimeout(fastTimeout);
    this.fastTimeout = null;
    const autoTimeout = this.autoTimeout;
    if (autoTimeout !== null) clearInterval(autoTimeout);
    this.autoTimeout = null;
  }
}
