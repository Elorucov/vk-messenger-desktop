import { useCallback, useState } from 'react';
import { toggleLocalVideo } from '@vkontakte/calls-sdk';
import { useTypedSelector } from './useTypedSelector';
import { getIsLocalVideoEnabled } from '../selectors';
export function useToggleVideo() {
    const isTurningOn = useTypedSelector(getIsLocalVideoEnabled);
    const [isVideoToggleProcessing, setIsVideoToggleProcessing] = useState(false);
    const handleToggleVideo = useCallback(() => {
        if (isVideoToggleProcessing) {
            return;
        }
        toggleLocalVideo(!isTurningOn)
            .catch(() => {
            /** падаем тихо, тк получим сообщение в коллбек
             * onPermissionsError при попытке включить камеру */
        })
            .finally(() => {
            setIsVideoToggleProcessing(false);
        });
    }, [isVideoToggleProcessing, isTurningOn]);
    return {
        isVideoToggleProcessing,
        handleToggleVideo,
    };
}
//# sourceMappingURL=useToggleVideo.js.map