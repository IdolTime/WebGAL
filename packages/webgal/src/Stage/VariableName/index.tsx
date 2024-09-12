import styles from './variableName.module.scss';
import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { useEffect, useMemo, useState } from 'react';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { px2 } from '@/Core/parser/utils';

export const VariableName = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  const guiState = useSelector((state: RootState) => state.GUI);
  const [barBgLayoutList, setBarBgLayoutList] = useState<{ width: number; height: number }[]>([]);
  const [barLayoutList, setBarLayoutList] = useState<{ width: number; height: number }[]>([]);

  const dataMap = useMemo(() => {
    const map = new Map();
    const showValues = stageState.showValues;

    if (showValues?.length) {
      showValues.forEach((e) => {
        map.set(e.key, e.value);
      });
    }

    return map;
  }, [stageState]);

  useEffect(() => {
    stageState.showValueList.forEach((e, i) => {
      if (e.isShowValueSwitch && barLayoutList[i]) {
        const value = dataMap.get(e.showValueName);

        if (e.showProgress && typeof value === 'number') {
          setTimeout(() => {
            const rect = document.getElementById(`myRect-${i}`);
            const width = (value / (e.maxValue ?? 100)) * barLayoutList[i].width;
            rect?.setAttribute('width', width.toString());
          }, 16);
        }
      }
    });
  }, [stageState.showValueList, barLayoutList]);

  return (
    <>
      {stageState.showValueList.map((item, i) => {
        if (item.isShowValueSwitch) {
          const barBgLayout = barBgLayoutList[i] || { width: 0, height: 0 };
          const barLayout = barLayoutList[i] || { width: 0, height: 0 };

          return (
            <div
              key={item.showValueName + i.toString()}
              className={styles.variableNameWrapper}
              style={{
                position: 'fixed',
                left: px2(item.showValueAxisX) + 'px',
                top: px2(item.showValueAxisY) + 'px',
                backgroundColor: item.showProgress ? 'transparent' : '#08c',
              }}
            >
              {!item.showProgress && (String(dataMap.get(item.showValueName)) || '')}
              {item.showProgress && item.progressBarBgStyle && (
                <img
                  src={assetSetter(item.progressBarBgStyle.image, fileType.ui)}
                  alt="progress"
                  className={styles.progressBarBg}
                  style={
                    barBgLayout.width ? { width: barBgLayout.width, height: barBgLayout.height, opacity: 1 } : undefined
                  }
                  onLoad={(e) => {
                    setBarBgLayoutList([
                      ...barBgLayoutList,
                      { width: px2(e.currentTarget.naturalWidth), height: px2(e.currentTarget.naturalHeight) },
                    ]);
                  }}
                />
              )}
              {item.showProgress && item.progressBarStyle && (
                <>
                  <img
                    src={assetSetter(item.progressBarStyle.image, fileType.ui)}
                    alt="progress"
                    className={styles.progressBar}
                    style={
                      barLayout.width
                        ? {
                            width: barLayout.width,
                            height: barLayout.height,
                            opacity: 1,
                            clipPath: `url(#myClip-${i})`,
                          }
                        : undefined
                    }
                    onLoad={(e) => {
                      setBarLayoutList([
                        ...barLayoutList,
                        { width: px2(e.currentTarget.naturalWidth), height: px2(e.currentTarget.naturalHeight) },
                      ]);
                    }}
                  />
                  <svg width="0" height="0">
                    <defs>
                      <clipPath id={`myClip-${i}`}>
                        <rect id={`myRect-${i}`} width="0" height={barLayout.height} style={{ fill: '#ffffff' }} />
                      </clipPath>
                    </defs>
                  </svg>
                </>
              )}
            </div>
          );
        }

        return null;
      })}
    </>
  );

  // return (
  //     stageState.isShowValueSwitch  ? (
  //         <div
  //             className={styles.variableNameWrapper}
  //             style={{
  //                 position: 'fixed',
  //                 left: stageState.showValueAxisX + 'px',
  //                 top: stageState.showValueAxisY + 'px',
  //             }}
  //         >
  //             {dataMap.get(stageState.showValueName) || ''}
  //         </div>
  //     ) : null

  // )
};
