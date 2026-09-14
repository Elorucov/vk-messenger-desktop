import { useCallback, useState } from 'react';
import { MediaOption } from '@vkontakte/calls-sdk';
import { checkPermissions } from '../../../permissions';
import { NotificationType } from '@vkontakte-internal/calls-core';
import { useCallsSDK } from '../../../providers/CallsSdkProvider';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useTypedDispatch } from '../../../hooks/useTypedDispatch';
import { setCallNotification } from '../../../actions';
import { getMyDevice, getNotification } from '../../../selectors';
export const useToggleAudio = () => {
    const localDevice = useTypedSelector(getMyDevice);
    const notification = useTypedSelector(getNotification);
    const dispatch = useTypedDispatch();
    const SDK = useCallsSDK();
    const [isAudioToggleProcessing, setIsAudioToggleProcessing] = useState(false);
    return useCallback(() => {
        if (isAudioToggleProcessing) {
            return;
        }
        const isTurningOn = !localDevice.mediaSettings.isAudioEnabled;
        const permissionPromise = isTurningOn ? checkPermissions(SDK, [MediaOption.AUDIO]) : Promise.resolve();
        permissionPromise.then(() => {
            setIsAudioToggleProcessing(true);
            if (notification?.type === NotificationType.SPEAKING_ON_MUTE) {
                dispatch(setCallNotification(null));
            }
            SDK.toggleLocalAudio(isTurningOn)
                .catch(() => {
                /** падаем тихо, тк получим сообщение в коллбек
                 * onPermissionsError при попытке включить микрофон */
            })
                .finally(() => {
                setIsAudioToggleProcessing(false);
            });
        });
    }, [localDevice.mediaSettings, isAudioToggleProcessing, notification]);
};
//# sourceMappingURL=useToggleAudio.js.map