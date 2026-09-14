import { useTypedSelector } from './useTypedSelector';
import { useCallback, useState } from 'react';
import { toggleLocalAudio } from '@vkontakte/calls-sdk';
import { getIsLocalAudioEnabled } from '../selectors';
export function useToggleAudio() {
    const isTurningOn = useTypedSelector(getIsLocalAudioEnabled);
    const [isAudioToggleProcessing, setIsAudioToggleProcessing] = useState(false);
    const handleToggleAudio = useCallback(() => {
        if (isAudioToggleProcessing) {
            return;
        }
        toggleLocalAudio(!isTurningOn)
            .catch(() => {
            /** падаем тихо, тк получим сообщение в коллбек
             * onPermissionsError при попытке включить микрофон */
        })
            .finally(() => {
            setIsAudioToggleProcessing(false);
        });
    }, [isAudioToggleProcessing, isTurningOn]);
    return {
        isAudioToggleProcessing,
        handleToggleAudio,
    };
}
//# sourceMappingURL=useToggleAudio.js.map