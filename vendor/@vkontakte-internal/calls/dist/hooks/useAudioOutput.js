import { useEffect, useRef, useState } from 'react';
import { browser, debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { makeSharedState } from '@vkontakte-internal/utils';
import { createVolumeDetector } from '../helpers/volumeDetector';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { useLocationChange } from './useLocationChange';
const getAudioOutputRequests = makeSharedState('callsAudioOutputRequests', () => new (class {
    constructor() {
        this._requests = {};
    }
    getUserAudio(deviceId) {
        if (!this._requests[deviceId || '']) {
            this._requests[deviceId || ''] = browser.getUserAudio(deviceId).finally(() => {
                delete this._requests[deviceId || ''];
            });
        }
        return this._requests[deviceId || ''];
    }
})(), { version: 1 });
export function useAudioOutput({ deviceId, isActive }) {
    const [requests] = useState(() => getAudioOutputRequests());
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const prevDeviceId = useRef(undefined);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const destroyVolumeDetector = useRef(undefined);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const isMounted = useIsMounted();
    const isActiveRef = useRef(isActive);
    isActiveRef.current = isActive;
    const cleanUp = () => {
        destroyVolumeDetector.current?.();
        destroyVolumeDetector.current = undefined;
    };
    const updateStream = async () => {
        const currentDeviceId = prevDeviceId.current;
        try {
            const mediaStream = await requests.getUserAudio(deviceId);
            if (currentDeviceId !== prevDeviceId.current || !isActiveRef.current || !isMounted()) {
                // пока получали стрим, поменялся девайс или успели выключить
                cleanUp();
                return;
            }
            destroyVolumeDetector.current = createVolumeDetector(mediaStream, (value) => setVolumeLevel(Math.floor(value * 100)));
            mediaStream?.getTracks().forEach((track) => track.stop());
        }
        catch (err) {
            debugMessage(DebugMessageType.ERROR, { err, deviceId });
        }
    };
    useEffect(() => {
        // микрофон был вырублен или сменился девайс
        if (!isActive || prevDeviceId.current !== deviceId) {
            cleanUp();
        }
        prevDeviceId.current = deviceId;
        if (isActive) {
            void updateStream();
        }
    }, [deviceId, isActive]);
    useLocationChange(cleanUp);
    return { volumeLevel };
}
//# sourceMappingURL=useAudioOutput.js.map