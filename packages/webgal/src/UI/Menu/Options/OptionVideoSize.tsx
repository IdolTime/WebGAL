import { FC, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSoundEffect from '@/hooks/useSoundEffect';
import { setStorage } from '@/Core/controller/storage/storageController';
import { videoSizeOption } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import styles from './OptionVideoSize.module.scss';
import { BgImage, Button, OptionSliderCustome } from '@/UI/Components/Base';
import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import { OptionSceneButtonKey, OptionSceneOtherKey, OptionSceneUIConfig, Scene } from '@/Core/UIConfigTypes';
interface IProps {
    label?: string;
}


export const OptionVideoSize: FC<IProps> = (props: IProps) => {
    const dispatch = useDispatch();
    const { playSeEnter, playSeClick } = useSoundEffect();
    const userDataState = useSelector((state: RootState) => state.userData);
    const [currentValue, setCurrentValue] = useState<videoSizeOption>(videoSizeOption.Size720P);
    const optionUIConfigs = useSelector(
        (state: RootState) => state.GUI.gameUIConfigs[Scene.option]
      ) as OptionSceneUIConfig;

    const sizeOptions = [
        videoSizeOption.Size1080P, 
        videoSizeOption.Size720P
    ]

    return (
        <div className={styles.OptionVideoSize_main}>
            {props.label && 
                <label className={styles.label}>{props.label}</label>
            }
            <Button
                key={OptionSceneOtherKey.Option_videoSize1080_checkbox}
                type="checkbox"
                checked={userDataState.optionData.videoSize === videoSizeOption.Size1080P}
                item={optionUIConfigs.other[OptionSceneOtherKey.Option_videoSize1080_checkbox]}
                defaultClass={`${styles.Options_checkbox} ${styles.Options_checkbox_1080P} ${
                    userDataState.optionData.videoSize === videoSizeOption.Size1080P ? styles.Options_checkbox_active : ''
                  }`
                }
                onMouseEnter={playSeEnter}
                onChecked={() => {
                    playSeClick();
                    setCurrentValue(sizeOptions[0])
                    dispatch(setOptionData({ key: 'videoSize', value: sizeOptions[0] }));
                    setStorage();
                }}
            />

            <Button
                key={OptionSceneOtherKey.Option_videoSize720_checkbox}
                type="checkbox"
                checked={userDataState.optionData.videoSize === videoSizeOption.Size720P}
                item={optionUIConfigs.other[OptionSceneOtherKey.Option_videoSize720_checkbox]}
                defaultClass={`${styles.Options_checkbox} ${styles.Options_checkbox_720P} ${
                    userDataState.optionData.videoSize === videoSizeOption.Size720P ? styles.Options_checkbox_active : ''
                  }`
                }
                onMouseEnter={playSeEnter}
                onChecked={() => {
                    playSeClick();
                    setCurrentValue(sizeOptions[1])
                    dispatch(setOptionData({ key: 'videoSize', value: sizeOptions[1] }));
                    setStorage();
                }}
            />
            {/* {sizeOptions.map((size: videoSizeOption) => {
                return (
                    <div key={size} className={styles.option_item}>
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
            })} */}
        
        </div>
    );
};