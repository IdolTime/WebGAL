/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */
import { logger } from './util/logger';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { assetSetter, fileType } from './util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { sceneParser } from './parser/sceneParser';
import { bindExtraFunc } from '@/Core/util/coreInitialFunction/bindExtraFunc';
import { webSocketFunc } from '@/Core/util/syncWithEditor/webSocketFunc';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from './util/prefetcher/scenePrefetcher';
import axios from 'axios';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { px2 } from './parser/utils';

const u = navigator.userAgent;
export const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否是 iOS终端

/**
 * 引擎初始化函数
 */
export const initializeScript = (): void => {
  // 打印初始log信息
  logger.info(__INFO.version);
  logger.info('Made with ❤ by IdolTime');
  // 激活强制缩放
  // 在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
  if (isIOS) {
    /**
     * iOS
     */
    alert(
      `iOS 用户请横屏使用以获得最佳体验
| iOS 用戶請橫屏使用以獲得最佳體驗`,
    );
  }

  // 获得 userAnimation
  loadStyle('./game/userStyleSheet.css');
  // 获得 user Animation
  getUserAnimation();
  // 获取游戏信息
  infoFetcher('./game/config.txt');
  // 获取start场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then(async (rawScene) => {
    const scene: any = await WebGAL.sceneManager.setCurrentScene(rawScene, 'start.txt', sceneUrl);
    if (!scene) return;
    // 开始场景的预加载
    const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
    WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);

    // 获取所有 解除成就场景对话
    const sentenceList = (scene?.sentenceList as ISentence[]) ?? [];
    const unlockAchieveList = sentenceList?.filter((e: any) => e?.commandRaw === 'unlockAchieve');
    webgalStore.dispatch(saveActions.setUnlockAchieveAllTotal(unlockAchieveList?.length ?? 0));
  });

  /**
   * iOS 设备 卸载所有 Service Worker
   */
  // if ('serviceWorker' in navigator && isIOS) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (const registration of registrations) {
  //       registration.unregister().then(() => {
  //         logger.info('已卸载 Service Worker');
  //       });
  //     }
  //   });
  // }

  /**
   * 绑定工具函数
   */
  bindExtraFunc();
  webSocketFunc();
};

function loadStyle(url: string) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
}

function getUserAnimation() {
  axios.get('./game/animation/animationTable.json').then((res) => {
    const animations: Array<string> = res.data;
    for (const animationName of animations) {
      axios.get(`./game/animation/${animationName}.json`).then((res) => {
        if (res.data) {
          const userAnimation = {
            name: animationName,
            effects: res.data,
          };
          WebGAL.animationManager.addAnimation(userAnimation);
        }
      });
    }
  });
}

export function initClickAnimation() {
  document.getElementById('root')?.addEventListener('click', function (event) {
    let target = event.target as HTMLElement; // 将 event.target 断言为 HTMLElement

    // 如果点击的不是按钮本身，可能是子元素，向上查找最接近的父级按钮
    if (!target.classList.contains('btn-clicked')) {
      target = target.closest('.btn-clicked') as HTMLElement;
    }

    if (target?.classList.contains('btn-clicked')) {
      const container = document.body;

      // 创建点击动画的图片元素
      const clickEffect = document.createElement('div');
      clickEffect.classList.add('click-frame');

      // 根据鼠标点击位置放置图片
      const { clientX: x, clientY: y } = event;
      // 打印clientX和clientY, pageX和pageY, x和y
      clickEffect.style.left = `${x - 79}px`; // 居中
      clickEffect.style.top = `${y - 84.5}px`;

      container?.appendChild(clickEffect);

      // 动态更新图片帧 (click0 - click9)
      let frame = 0;
      const updateFrame = () => {
        if (frame > 9) {
          // 当所有帧都显示完毕后，延迟移除元素
          setTimeout(() => {
            container?.removeChild(clickEffect);
          }, 0);
        } else {
          // 更新当前帧的背景图片
          clickEffect.style.backgroundImage = `url('./assets/click${frame}.png')`;
          frame++;

          // 使用递归的 setTimeout 来模拟下一帧的执行
          setTimeout(updateFrame, 48); // 每帧间隔 48ms
        }
      };

      // 启动动画帧更新
      setTimeout(updateFrame, 48); // 初始延时启动
    }
  });
}
