import { BacklogManager } from '@/Core/Modules/backlog';
import mitt from 'mitt';
import { SceneManager } from '@/Core/Modules/scene';
import { AnimationManager } from '@/Core/Modules/animations';
import { Gameplay } from './Modules/gamePlay';
import { Events } from '@/Core/Modules/events';
import { VideoManager } from './Modules/video';

export class WebgalCore {
  public sceneManager = new SceneManager();
  public backlogManager = new BacklogManager(this.sceneManager);
  public animationManager = new AnimationManager();
  public gameplay = new Gameplay();
  public gameName = '';
  public gameKey = '';
  public gameId = 0;
  public channel = '0';
  public events = new Events();
  public videoManager = new VideoManager();
}
