import styles from './backlog.module.scss';
import { CloseSmall, Return, VolumeNotice } from '@icon-park/react';
import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { logger } from '@/Core/util/logger';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import useTrans from '@/hooks/useTrans';
import { compileSentence, splitChars } from '@/Stage/TextBox/TextBox';
import useSoundEffect from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { getAudioUrl } from '@/Core/util/getAudioUrl';

export const Backlog = () => {
  const t = useTrans('gaming.');
  // logger.info('Backlog render');
  const { playSeEnter, playSeClick } = useSoundEffect();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const iconSize = '0.8em';
  const [indexHide, setIndexHide] = useState(false);
  const [isDisableScroll, setIsDisableScroll] = useState(false);
  let timeRef = useRef<ReturnType<typeof setTimeout>>();
  const [url, setUrl] = useState('');
  const clickedTimeRef = useRef(0);

  // 缓存一下vdom
  const backlogList = useMemo<any>(() => {
    let backlogs = [];
    // logger.info('backlogList render');
    for (let i = 0; i < WebGAL.backlogManager.getBacklog().length; i++) {
      const backlogItem = WebGAL.backlogManager.getBacklog()[i];
      const showTextArray = compileSentence(backlogItem.currentStageState.showText, 3, true);
      const showTextArrayReduced = mergeStringsAndKeepObjects(showTextArray);
      const showTextElementList = showTextArrayReduced.map((line, index) => {
        return (
          <div key={`backlog-line-${index}`}>
            {line.map((e, index) => {
              if (e === '<br />') {
                return <br key={`br${index}`} />;
              } else {
                return e;
              }
            })}
          </div>
        );
      });
      const singleBacklogView = (
        <div
          className={styles.backlog_item}
          style={{ animationDelay: `${20 * (WebGAL.backlogManager.getBacklog().length - i)}ms` }}
          key={'backlogItem' + backlogItem.currentStageState.showText + backlogItem.saveScene.currentSentenceId}
        >
          <div
            className={styles.backlog_content_container}
            onClick={(e) => {
              playSeClick();
              jumpFromBacklog(i);
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className={styles.backlog_func_area}>
              {/* <div
                onClick={(e) => {c
                  playSeClick();
                  jumpFromBacklog(i);
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseEnter={playSeEnter}
                className={`${styles.backlog_item_button_element} interactive`}
              >
                <Return theme="outline" size={iconSize} fill="#ffffff" strokeWidth={3} />
              </div> */}
              <div className={styles.backlog_item_content_name}>
                {(backlogItem.currentStageState.showName && `【${backlogItem.currentStageState.showName}】`) || ''}
              </div>
              {backlogItem.currentStageState.vocal ? (
                <div
                  onMouseDown={(e) => {
                    const node = e.currentTarget as HTMLDivElement;
                    node.className = `${styles.backlog_item_button_element} interactive btn-clicked`;
                    clickedTimeRef.current = Date.now();
                  }}
                  onMouseUp={(e) => {
                    const duration = Date.now() - clickedTimeRef.current;
                    let node = e.currentTarget;

                    setTimeout(
                      () => {
                        node.className = `${styles.backlog_item_button_element} interactive`;
                        // @ts-ignore
                        node = null;
                      },
                      duration - 350 > 0 ? 0 : 350 - duration,
                    );
                  }}
                  onClick={(e) => {
                    playSeClick();
                    e.preventDefault();
                    e.stopPropagation();
                    // 获取到播放 backlog 语音的元素
                    const backlog_audio_element: any = document.getElementById('backlog_audio_play_element_' + i);
                    if (backlog_audio_element) {
                      backlog_audio_element.currentTime = 0;
                      const userDataStore = webgalStore.getState().userData;
                      const mainVol = userDataStore.optionData.volumeMain;
                      backlog_audio_element.volume = mainVol * 0.01 * userDataStore.optionData.vocalVolume * 0.01;

                      getAudioUrl(backlogItem.currentStageState.vocal).then(() => {
                        setUrl(url);
                        backlog_audio_element.load();
                        if (backlog_audio_element) {
                          backlog_audio_element.onloadeddata = () => {
                            backlog_audio_element.play();
                          };
                        }
                      });
                    }
                  }}
                  onMouseEnter={playSeEnter}
                  className={`${styles.backlog_item_button_element} interactive`}
                >
                  <span className={styles.sound_icon} />
                </div>
              ) : null}
            </div>
            <div className={styles.backlog_item_content}>
              <span className={styles.backlog_item_content_text}>{showTextElementList}</span>
            </div>
          </div>
          <audio id={'backlog_audio_play_element_' + i} src={url} />
        </div>
      );
      backlogs.unshift(singleBacklogView);
    }
    return backlogs;
  }, [
    WebGAL.backlogManager.getBacklog()[WebGAL.backlogManager.getBacklog().length - 1]?.saveScene?.currentSentenceId ??
      0,
  ]);
  useEffect(() => {
    /* 切换为展示历史记录时触发 */
    if (GUIStore.showBacklog) {
      // logger.info('展示backlog');
      // 立即清除 防止来回滚动时可能导致的错乱
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
      // setIsDisableScroll(false);
      // 重新把index调回正数
      setIndexHide(false);
      // 向上滑动触发回想时会带着backlog一起滑一下 我也不知道为什么，可能是我的鼠标问题 所以先ban掉滚动
      setIsDisableScroll(true);
      // nextTick开启滚动
      setTimeout(() => {
        setIsDisableScroll(false);
      }, 0);
    } else {
      /* 隐藏历史记录触发 */
      // 这里是为了让backlog的z-index降低
      timeRef.current = setTimeout(() => {
        setIndexHide(true);
        // setIsDisableScroll(false);
        // setIsDisableScroll(true);
        timeRef.current = undefined;
        // 700是和动画一样的延时 保险起见多个80ms
        // 不加也没啥 问题不大
      }, 700 + 80);
    }
  }, [GUIStore.showBacklog]);
  return (
    <>
      {
        // ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
        <div
          className={`
          ${GUIStore.showBacklog ? styles.Backlog_main : styles.Backlog_main_out}
          ${indexHide ? styles.Backlog_main_out_IndexHide : ''}
          `}
        >
          <div
            className={styles.backlog_title}
            onClick={() => {
              logger.info('Rua! Testing');
            }}
          >
            <div
              className={`${styles.backlog_top_icon} interactive`}
              onMouseDown={(e) => {
                const node = e.currentTarget as HTMLDivElement;
                node.className = `${styles.backlog_top_icon} interactive btn-clicked`;
                clickedTimeRef.current = Date.now();
              }}
              onMouseUp={(e) => {
                const duration = Date.now() - clickedTimeRef.current;
                let node = e.currentTarget;

                setTimeout(
                  () => {
                    node.className = `${styles.backlog_top_icon} interactive`;
                    // @ts-ignore
                    node = null;

                    setTimeout(() => {
                      playSeClick();
                      dispatch(setVisibility({ component: 'showBacklog', visibility: false }));
                      dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
                    }, 320);
                  },
                  duration - 350 > 0 ? 0 : 350 - duration,
                );
              }}
              onMouseEnter={playSeEnter}
              // theme="outline"
              // size="4em"
              // fill="#ffffff"
              // strokeWidth={3}
            />
          </div>
          {GUIStore.showBacklog && (
            <div className={`${styles.backlog_content} ${isDisableScroll ? styles.Backlog_main_DisableScroll : ''}`}>
              {backlogList}
            </div>
          )}
        </div>
      }
    </>
  );
};

function mergeStringsAndKeepObjects(arr: ReactNode[]): ReactNode[][] {
  let result = [];
  let currentString = '';

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arr.length; i++) {
    const currentItem = arr[i];

    if (typeof currentItem === 'string') {
      currentString += currentItem;
    } else {
      if (currentString !== '') {
        result.push(currentString);
        currentString = '';
      }
      result.push(currentItem);
    }
  }

  if (currentString !== '') {
    result.push(currentString);
  }

  return result as ReactNode[][];
}
