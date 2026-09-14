import { useEffect, useRef, useState } from 'react';
import { browser, debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { useBackgroundsList } from '../../../components/VirtualBackgroundSettings/hooks/useBackgroundsList';
import { useInitialBackgroundEffect } from '../../../components/VirtualBackgroundSettings/hooks/useInitialBackgroundEffect';
import { useVideoEffects } from '../../../components/VirtualBackgroundSettings/hooks/useVideoEffects';
import { EVideoEffectType } from '../../../constants';
import { effectStorage } from '../../../helpers/localStorage';
import { useUserBackgrounds } from '../../../hooks/useUserBackgrounds';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { useLocationChange } from '../../../hooks/useLocationChange';
export function useVideoOutput({ $video, deviceId, isActive, isSferum, setMediaLoading, }) {
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const deviceIdRef = useRef(undefined);
    const isActiveRef = useRef(isActive);
    isActiveRef.current = isActive;
    const [stream, setStream] = useState(null);
    const isMounted = useIsMounted();
    const { photos } = useUserBackgrounds({ photos: [], isSferum });
    const { backgroundList } = useBackgroundsList({ photos });
    const { onUpdateVirtualBackground } = useVideoEffects({
        backgroundList,
        $video,
        userStream: stream,
        previewMode: true,
    });
    useInitialBackgroundEffect({
        // onSettingsChange never gets called with NONE effect from useInitialBackgroundEffect hook
        onSettingsChange: (settings) => onUpdateVirtualBackground(settings),
        userStream: stream,
        backgroundList,
        isVideoEnabled: isActive,
    });
    const stopStream = (stream) => stream?.getTracks().forEach((track) => track.stop());
    function cleanUp() {
        stopStream(stream);
        setStream(null);
        const mediaEl = $video.current;
        if (mediaEl) {
            mediaEl.srcObject = null;
        }
    }
    async function updateStream() {
        try {
            setMediaLoading(true);
            const currentDeviceId = deviceIdRef.current;
            const mediaStream = await browser.getUserVideo(deviceId);
            if (currentDeviceId !== deviceIdRef.current || !isActiveRef.current || !isMounted()) {
                // пока получали стрим, поменялся девайс или успели выключить
                stopStream(mediaStream);
                return;
            }
            const videoEl = $video.current;
            if (videoEl) {
                setStream(mediaStream);
                if (effectStorage.getEffect().type === EVideoEffectType.NONE) {
                    videoEl.srcObject = mediaStream;
                    videoEl.muted = true;
                    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/async-mix-syntax
                    videoEl.play().catch((error) => {
                        debugMessage(DebugMessageType.ERROR, { error, stream: mediaStream });
                    });
                }
            }
        }
        catch (err) {
            debugMessage(DebugMessageType.ERROR, { err, deviceId });
        }
        finally {
            setMediaLoading(false);
        }
    }
    useEffect(() => {
        // выключили или изменился выбранный девайс
        if (!isActive || deviceIdRef.current !== deviceId) {
            cleanUp();
        }
        deviceIdRef.current = deviceId;
        if (isActive) {
            updateStream();
        }
    }, [deviceId, isActive]);
    useLocationChange(cleanUp);
}
//# sourceMappingURL=useVideoOutput.js.map