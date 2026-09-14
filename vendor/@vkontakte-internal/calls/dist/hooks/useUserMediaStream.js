import { useEffect, useCallback, useState, useRef } from 'react';
import { eventBus } from '../services/eventBus';
import { CallsEventType } from '@vkontakte-internal/calls-core';
import { useIsMounted } from '@vkontakte-internal/react-utils';
import { browser } from '@vkontakte/calls-sdk';
const stopAllMediaTracks = (stream) => {
    stream.getTracks().forEach((track) => track.stop());
};
export const useUserMediaStream = (streamGetter) => {
    const [userStream, setUserStream] = useState(null);
    const [error, setError] = useState(false);
    const loading = useRef(false);
    const isMounted = useIsMounted();
    const savedCamera = useRef(null);
    const isSameDevice = (sdkSavedCamera) => {
        return savedCamera.current && savedCamera.current.deviceId === sdkSavedCamera?.deviceId;
    };
    const updateUserMediaStream = useCallback(() => {
        if (loading.current || !isMounted() || isSameDevice(browser.getSavedCamera())) {
            return;
        }
        setError(false);
        loading.current = true;
        return streamGetter()
            .then((stream) => {
            if (isMounted()) {
                setUserStream(stream);
                savedCamera.current = browser.getSavedCamera();
            }
            else {
                stopAllMediaTracks(stream);
            }
        })
            .catch((err) => {
            setUserStream(null);
            setError(err);
        })
            .finally(() => {
            loading.current = false;
        });
    }, [streamGetter]);
    useEffect(() => {
        updateUserMediaStream();
        eventBus.on(CallsEventType.DEVICE_CHANGED, updateUserMediaStream);
        return () => {
            eventBus.off(CallsEventType.DEVICE_CHANGED, updateUserMediaStream);
        };
    }, [updateUserMediaStream]);
    useEffect(() => {
        return () => {
            if (userStream) {
                stopAllMediaTracks(userStream);
            }
        };
    }, [userStream]);
    return {
        userStream,
        error,
        updateUserMediaStream,
    };
};
//# sourceMappingURL=useUserMediaStream.js.map