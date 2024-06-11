import styles from './variableName.module.scss'
import { useSelector } from 'react-redux'
import { RootState, webgalStore } from '@/store/store';


export const VariableName = () => {
    const stageState = useSelector((state: RootState) => state.stage);

    return (
        stageState.isShowValueSWitch  ? (
            <div 
                className={styles.variableNameWrapper}
                style={{
                    position: 'fixed',
                    left: stageState.showValueAxisX + 'px',
                    top: stageState.showValueAxisY + 'px',
                }}
            >
                { stageState.showValueName }
            </div>
        ) : null
        
    )
}
