import { useRef, useEffect, useCallback } from 'react';
import { EVideoEffectType, VIRTUAL_BACKGROUND_BLUR_ID } from '../../../constants';
import { effectStorage } from '../../../helpers/localStorage';
import { getPhotoById } from '../utils';
import { useSendStatsDataVirtualBackground } from '../../../hooks/useSendStatsDataVirtualBackground';
import { handlePromiseError } from '../../../helpers/logger';
/**
 * хук для применения "сохраненных" настроек
 *
 * 1. хранит промежуточные состояния
 * 2. применяет на sdk стриме при "сохранении"
 */
export const useSavedSettings = ({ chosen, settingsOpened, onSettingsChange, setChosen, backgroundList, isVideoEnabled, }) => {
    const { sendVirtualBackgroundSelected, sendVirtualBackgroundDisabled } = useSendStatsDataVirtualBackground();
    const storedSettings = useRef(null);
    /** при открытии настроек замыкаем текущие состояния */
    useEffect(() => {
        if (settingsOpened) {
            storedSettings.current = chosen;
        }
    }, [settingsOpened]);
    /**
     * сохраняет выбранные настройки и применяет для:
     * 1. localStorage
     * 2. sdk
     */
    const onApplySettings = useCallback(() => {
        // если настройки не обновились
        if (storedSettings.current === chosen) {
            return;
        }
        /** предыдущее значение выбранного эффекта */
        const prevEffect = effectStorage.getEffect();
        // 1. localStorage
        effectStorage.saveEffect(chosen);
        // 2. sdk
        if (chosen.type === EVideoEffectType.BACKGROUND) {
            /** then it's photo id */
            getPhotoById(chosen.id, backgroundList)
                .then((background) => {
                if (background) {
                    onSettingsChange({
                        type: EVideoEffectType.BACKGROUND,
                        value: background.url,
                    });
                    // отправляем статистику
                    if (isVideoEnabled) {
                        sendVirtualBackgroundSelected(background.id, prevEffect);
                    }
                }
            })
                .catch(handlePromiseError);
        }
        else if (chosen.type === EVideoEffectType.OVERLAY) {
            /** then it's photo id */
            getPhotoById(chosen.id, backgroundList)
                .then((background) => {
                if (background) {
                    onSettingsChange({
                        type: EVideoEffectType.OVERLAY,
                        value: background.url,
                    });
                    // TODO: добавить отдельную стату для overlay эффектов или использовать существующую
                    // if (isVideoEnabled) {
                    //   sendVirtualBackgroundSelected(background.id, prevEffect);
                    // }
                }
            })
                .catch(handlePromiseError);
        }
        else if (chosen.type === EVideoEffectType.BLUR) {
            /** then it's blurred effect */
            onSettingsChange({ type: EVideoEffectType.BLUR });
            // отправляем статистику
            if (isVideoEnabled) {
                sendVirtualBackgroundSelected(VIRTUAL_BACKGROUND_BLUR_ID, prevEffect);
            }
        }
        else if (chosen.type === EVideoEffectType.NONE) {
            /** then it's no effect */
            onSettingsChange({ type: EVideoEffectType.NONE });
            // отправляем статистику
            if (isVideoEnabled) {
                sendVirtualBackgroundDisabled(prevEffect);
            }
        }
    }, [
        onSettingsChange,
        backgroundList,
        chosen,
        sendVirtualBackgroundSelected,
        sendVirtualBackgroundDisabled,
        isVideoEnabled,
    ]);
    /**
     * восстанавливает изначальные настройки
     * 1. обновляем выбранный элемент меню (`chosen`)
     */
    const onRestoreSettings = useCallback(() => {
        if (storedSettings.current) {
            setChosen(storedSettings.current);
        }
    }, [setChosen]);
    return {
        onApplySettings,
        onRestoreSettings,
    };
};
//# sourceMappingURL=useSavedSettings.js.map