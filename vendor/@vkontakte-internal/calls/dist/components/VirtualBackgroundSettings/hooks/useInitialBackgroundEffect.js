import { useEffect } from 'react';
import { getPhotoById } from '../utils';
import { EVideoEffectType, VIRTUAL_BACKGROUND_BLUR_ID } from '../../../constants';
import { effectStorage } from '../../../helpers/localStorage';
import { useSendStatsDataVirtualBackground } from '../../../hooks/useSendStatsDataVirtualBackground';
import { handlePromiseError } from '../../../helpers/logger';
/** применяет настройки фона, сохраненные в `localStorage` */
export const useInitialBackgroundEffect = ({ userStream, onSettingsChange, backgroundList, isVideoEnabled, }) => {
    const { sendVirtualBackgroundSelected, sendVirtualBackgroundDisabled } = useSendStatsDataVirtualBackground();
    useEffect(() => {
        if (!userStream) {
            return;
        }
        const currEffect = effectStorage.getEffect();
        if (!isVideoEnabled) {
            /** user turned off camera */
            onSettingsChange({ type: EVideoEffectType.NONE });
            sendVirtualBackgroundDisabled(currEffect);
        }
        else if (currEffect.type === EVideoEffectType.BACKGROUND) {
            /** then it's photo id */
            getPhotoById(currEffect.id, backgroundList)
                .then((photo) => {
                if (photo) {
                    onSettingsChange({
                        type: EVideoEffectType.BACKGROUND,
                        value: photo.url,
                    });
                    // отправляем статистику
                    sendVirtualBackgroundSelected(photo.id, currEffect);
                }
            })
                .catch(handlePromiseError);
        }
        else if (currEffect.type === EVideoEffectType.OVERLAY) {
            /** then it's photo id */
            getPhotoById(currEffect.id, backgroundList)
                .then((photo) => {
                if (photo) {
                    onSettingsChange({
                        type: EVideoEffectType.OVERLAY,
                        value: photo.url,
                    });
                    // TODO: добавить отдельную стату для overlay эффектов или использовать существующую
                    // sendVirtualBackgroundSelected(photo.id, currEffect.id);
                }
            })
                .catch(handlePromiseError);
        }
        else if (currEffect.type === EVideoEffectType.BLUR) {
            /** then it's blurred effect */
            onSettingsChange({ type: EVideoEffectType.BLUR });
            // отправляем статистику
            sendVirtualBackgroundSelected(VIRTUAL_BACKGROUND_BLUR_ID, currEffect);
        }
    }, [userStream, isVideoEnabled]);
};
//# sourceMappingURL=useInitialBackgroundEffect.js.map