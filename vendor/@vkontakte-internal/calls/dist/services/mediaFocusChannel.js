import { MediaFocus } from '@vkontakte-internal/plugins';
import { useEffect } from 'react';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { getMode } from '../selectors';
import { Mode } from '@vkontakte-internal/calls-core';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
export let mediaFocusChannel = null;
export let mediaSession = navigator.mediaSession;
/**
 * Хелпер для создания MediaFocusChannel. В планах скрыть это под ручкой, чтоб переключать на navigator, если что
 */
export function createMediaFocusChannel() {
    try {
        mediaFocusChannel = MediaFocus.ensure().createUncontrolledChannel('calls');
        mediaSession = mediaFocusChannel.mediaSession;
    }
    catch (err) {
        debugMessage(DebugMessageType.ERROR, {
            message: `Cannot create mediaFocusChannel`,
        });
    }
}
/**
 * Хук, который запускает и останавливает mediaFocusChannel.
 */
export const useHandleMediaFocusChannel = () => {
    const mode = useTypedSelector(getMode);
    useEffect(() => {
        if (mode === Mode.CALL && mediaFocusChannel) {
            mediaFocusChannel?.start();
            return () => {
                mediaFocusChannel?.stop();
            };
        }
    }, [mode]);
};
//# sourceMappingURL=mediaFocusChannel.js.map