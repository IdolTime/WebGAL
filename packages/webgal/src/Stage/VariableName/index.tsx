import styles from './variableName.module.scss'
import { useSelector } from 'react-redux'
import { RootState, webgalStore } from '@/store/store';
import { useMemo } from 'react';


export const VariableName = () => {
    const stageState = useSelector((state: RootState) => state.stage);
    

    const dataMap = useMemo(() => {
        const map = new Map();
        const showValues = stageState.showValues;

        if (showValues?.length) {
            showValues.forEach((e) => {
                map.set(e.key, e.value)
            })
        }

        return map

    }, [stageState])

    return (
        <>
            {stageState.showValueList?.length && stageState.showValueList?.map(item => {
                if (item.isShowValueSWitch) {
                    return (
                        <div 
                            className={styles.variableNameWrapper}
                            style={{
                                position: 'fixed',
                                left: item.showValueAxisX + 'px',
                                top: item.showValueAxisY + 'px',
                            }}
                        >
                            {dataMap.get(item.showValueName) || ''}
                        </div>
                    )
                }

                return null
            }) || null}
        </>
    )

    // return (
    //     stageState.isShowValueSWitch  ? (
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
}
