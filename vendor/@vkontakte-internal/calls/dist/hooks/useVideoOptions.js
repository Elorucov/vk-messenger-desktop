import { useCallback, useEffect, useState } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { useTypedDispatch } from './useTypedDispatch';
import { E_ACTION } from '../constants';
import { videoOptionsStorage } from '../helpers/localStorage';
import { EVideoOptionType } from '@vkontakte-internal/calls-core';
import { isEqual } from '@vkontakte/vkjs';
/** хук для использования опций для видео */
export const useVideoOptions = () => {
    /**
     * настройки видео из стора
     *
     * если вы хотите реактивный стейт, в котором текущие
     * сохраненные настройки, то нужно использовать именно это
     */
    const storedVideoOptions = useTypedSelector((state) => state.virtualBackgroundSettings?.videoOptions);
    const dispatch = useTypedDispatch();
    /** настройки видео (локальные, не влияют на глобальный стор) */
    const [videoOptions, setVideoOptions] = useState(videoOptionsStorage.getOptions);
    /** коллбек при "отмене" сохранения настроек */
    const onRestoreSettings = useCallback(() => {
        setVideoOptions(videoOptionsStorage.getOptions());
    }, []);
    /** коллбек при сохранении настроек */
    const onSaveSettings = useCallback(() => {
        videoOptionsStorage.saveOptions(videoOptions);
        dispatch({
            type: E_ACTION.VB_SET_VIDEO_OPTIONS,
            videoOptions,
        });
    }, [videoOptions]);
    const onChangeVideoOption = useCallback((event) => {
        setVideoOptions((prev) => ({ ...prev, [event.target.name]: event.target.checked }));
    }, []);
    /** on-mount */
    useEffect(() => {
        if (!isEqual(storedVideoOptions, videoOptions)) {
            dispatch({
                type: E_ACTION.VB_SET_VIDEO_OPTIONS,
                videoOptions,
            });
        }
    }, []);
    return {
        videoOptions,
        storedVideoOptions,
        setVideoOptions,
        onRestoreSettings,
        onSaveSettings,
        onChangeVideoOption,
    };
};
export { EVideoOptionType };
//# sourceMappingURL=useVideoOptions.js.map