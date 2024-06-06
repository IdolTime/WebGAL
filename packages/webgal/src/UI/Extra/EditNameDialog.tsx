import { useState, useEffect } from "react";
import styles from './extra.module.scss'

interface IProps {
    value: string;
    onCancel: () => void
    onConfirm: (val: string) => void
}

const EditNameDialog = (props: IProps) => {
    const [inputValue, setInputValue] = useState<string>('');

    useEffect(() => {
        if (props.value) {
            setInputValue(props.value)
        }
    }, [])

    /** 确认 */
    const handleConfirm = () => {
        props.onConfirm(inputValue)
    }

    /** 取消 */
    const handleCancel = () => {
        props.onCancel()
    }

    return (
        <>
            <div className={styles.editDialogMark}></div>
            <div className={styles.editDialog}>
                <div className={styles.editDialog_content}>
                    <label>重新命名为：</label>
                    <input 
                        value={inputValue} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setInputValue(e.target.value)
                        }} 
                    />
                </div>
                <div className={styles.editDialog_footer}>
                    <span className={styles.button} onClick={handleConfirm}>
                        确认
                    </span>
                    <span className={styles.button} onClick={handleCancel}>
                        取消
                    </span>
                </div>
            </div>
        </>
    )
}

export default EditNameDialog