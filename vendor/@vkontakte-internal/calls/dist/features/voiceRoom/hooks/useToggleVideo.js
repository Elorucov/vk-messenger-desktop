import { useCallback, useState } from 'react';
import { checkPermissions } from '../../../permissions';
import { MediaOption } from '@vkontakte/calls-sdk';
import { useTypedSelector } from '../../../hooks/useTypedSelector';
import { useCallsSDK } from '../../../providers/CallsSdkProvider';
import { getMyMediaSettings } from '../../../selectors';
export const useToggleVideo = () => {
    const SDK = useCallsSDK();
    const mySettings = useTypedSelector(getMyMediaSettings);
    const [isVideoToggleProcessing, setIsVideoToggleProcessing] = useState(false);
    return useCallback(() => {
        if (isVideoToggleProcessing) {
            return;
        }
        const permissionPromise = !mySettings.isVideoEnabled
            ? checkPermissions(SDK, [MediaOption.VIDEO])
            : Promise.resolve();
        permissionPromise.then(() => {
            setIsVideoToggleProcessing(true);
            SDK.toggleLocalVideo(!mySettings.isVideoEnabled)
                .catch(() => {
                /** падаем тихо, тк получим сообщение в коллбек
                 * onPermissionsError при попытке включить камеру */
            })
                .finally(() => {
                setIsVideoToggleProcessing(false);
            });
        });
    }, [mySettings, isVideoToggleProcessing]);
};
//# sourceMappingURL=useToggleVideo.js.map