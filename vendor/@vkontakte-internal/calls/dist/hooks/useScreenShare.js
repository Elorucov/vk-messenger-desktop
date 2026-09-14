import { useCallback } from 'react';
import { E_ACTION } from '../constants';
import { useTypedDispatch } from './useTypedDispatch';
import { useTypedSelector } from './useTypedSelector';
import { useLang } from './useLang';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { debugMessage, DebugMessageType, browser, stopUrlSharing } from '@vkontakte/calls-sdk';
// импорт не из index в связи с проблемой циклических зависимостей в тестах
import { hideSharedMiniApp } from '../features/miniApps/actions';
import { isSharedMiniAppShownFromDevice } from '@vkontakte-internal/calls-core';
export const handleErrorScreenShare = (dispatch, getLang) => {
    if (browser.os() === 'MacOS' && browser.browserName() === 'Chrome') {
        dispatch({
            type: E_ACTION.ERROR,
            text: getLang('calls_error_disabled_screen_sharing_macos_chrome'),
        });
    }
    else {
        dispatch({
            type: E_ACTION.ERROR,
            text: getLang('calls_error_disabled_screen_sharing'),
        });
    }
};
export const useScreenShare = () => {
    const SDK = useCallsSDK();
    const { getLang } = useLang();
    const localDevice = useTypedSelector((state) => state.localDevice);
    const dispatch = useTypedDispatch();
    const handleStopScreenShare = useCallback(() => {
        return SDK.captureScreen({
            captureScreen: false,
            captureAudio: false,
            fastScreenSharing: false,
        }).catch(() => handleErrorScreenShare(dispatch, getLang));
    }, []);
    const onToggleScreenShare = useCallback((isFastScreenShare = false) => {
        if (isSharedMiniAppShownFromDevice(localDevice)) {
            dispatch(hideSharedMiniApp(localDevice));
            stopUrlSharing().catch((err) => {
                debugMessage(DebugMessageType.ERROR, err);
            });
        }
        return SDK.captureScreen({
            captureScreen: true,
            captureAudio: true,
            fastScreenSharing: isFastScreenShare,
        }).catch(() => handleErrorScreenShare(dispatch, getLang));
    }, [localDevice]);
    const handleStartFastScreenShare = useCallback(() => {
        onToggleScreenShare(true);
    }, [onToggleScreenShare]);
    const handleStartScreenShare = useCallback(() => {
        onToggleScreenShare();
    }, [onToggleScreenShare]);
    return {
        handleStartScreenShare,
        handleStartFastScreenShare,
        handleStopScreenShare,
    };
};
//# sourceMappingURL=useScreenShare.js.map