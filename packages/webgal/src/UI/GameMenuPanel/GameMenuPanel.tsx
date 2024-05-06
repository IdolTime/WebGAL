import styles from './gameMenuPanel.module.scss'
import useSoundEffect from '@/hooks/useSoundEffect';

export const GameMenuPanel = () => {

    const { playSeEnter, playSeClick, playSeDialogOpen } = useSoundEffect();

    return (
        <div className={styles.gameMenuPanel}>
            <div 
                className={styles.menuButton}
                onClick={() => {
                    alert('游戏菜单');
                    // setComponentVisibility('showBacklog', true);
                    // setComponentVisibility('showTextBox', false);
                    // playSeClick();
                  }}
                  onMouseEnter={playSeEnter}    
            ></div>
        </div>
    )
}