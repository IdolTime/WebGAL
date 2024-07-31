import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setStorage } from '@/Core/controller/storage/storageController';
import { videoSizeOption } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import styles from './OptionVideoSize.module.scss';
interface IProps {
    label?: string;
}


export const OptionVideoSize: FC<IProps> = (props: IProps) => {
    const dispatch = useDispatch()
    const { playSeEnter, playSeClick } = useSoundEffect();
    const [currentValue, setCurrentValue] = useState<videoSizeOption>(videoSizeOption.Size720P);

    const sizeOptions = [
        videoSizeOption.Size1080P, 
        videoSizeOption.Size720P
    ]

    return (
        <div className={styles.OptionVideoSize_main}>
            {props.label && 
                <label className={styles.label}>{props.label}</label>
            }
            {sizeOptions.map((size: videoSizeOption) => {
                return (
                    <div key={size} className={styles.option_item}>
                        <span>{size}</span>
                        <div
                            className={
                                `${styles.option_item_checkbox} ${
                                    currentValue === size ? styles.option_item_checkbox_active : ''
                            }`}
                            onMouseEnter={playSeEnter}
                            onClick={() => {
                            playSeClick();
                            setCurrentValue(size)
                            dispatch(setOptionData({ key: 'videoSize', value: size }));
                            setStorage();
                            }}
                        />
                    </div>
                )
            })}
        
        </div>
    );
};