import { useCallback, useEffect, useRef, useState } from 'react';
import { browser, debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import * as SDK from '@vkontakte/calls-sdk';
import { CallsEventType } from '@vkontakte-internal/calls-core';
import { handlePromiseError } from '../../../helpers/logger';
import { currentBrowser } from '../../../helpers/currentBrowser';
import { createDeviceChangeHandler } from '../../../services/device';
import { eventBus } from '../../../services/eventBus';
const getAvailableDevices = (devices) => devices.filter((device) => Boolean(device.deviceId));
export function useBrowserMedia() {
    const [browserMedia, setBrowserMedia] = useState({
        isCamAvailable: false,
        isMicAvailable: false,
    });
    const [currentCamId, setCurrentCamId] = useState('');
    const [currentMicId, setCurrentMicId] = useState('');
    const [cameras, setCameras] = useState([]);
    const [mics, setMics] = useState([]);
    const [savedCam, setSavedCam] = useState(null);
    const [savedMic, setSavedMic] = useState(null);
    const isUserMediaRequested = useRef(false);
    // запросить доступ к микро/камере, или отобразить информацию о доступных
    const getUserMedia = ({ needVideo, needAudio, onSuccess }) => {
        if (isUserMediaRequested.current) {
            return Promise.resolve();
        }
        isUserMediaRequested.current = true;
        return browser
            .getUserMedia(!!needVideo, !!needAudio, false)
            .then((stream) => {
            const isAudioTracks = !!stream.getAudioTracks().length;
            const isVideoTracks = !!stream.getVideoTracks().length;
            stream.getTracks().forEach((track) => track.stop());
            const isCamAvailable = browser.hasCamera() && browser.hasCameraPermission();
            const isMicAvailable = browser.hasMicrophone() && browser.hasMicrophonePermission();
            setBrowserMedia({ isCamAvailable, isMicAvailable });
            let isSuccess = false;
            if (needVideo && isVideoTracks) {
                const savedCam = browser.getSavedCamera();
                setCurrentCamId(savedCam?.deviceId ?? cameras[0].deviceId);
                isSuccess = true;
            }
            if (needAudio && isAudioTracks) {
                const savedMic = browser.getSavedMicrophone();
                setCurrentMicId(savedMic?.deviceId ?? mics[0].deviceId);
                isSuccess = true;
            }
            if (currentBrowser.isSafari || currentBrowser.isFirefox) {
                setCameras(getAvailableDevices(browser.getCameras()));
                setMics(getAvailableDevices(browser.getMicrophones()));
            }
            if (isSuccess) {
                onSuccess?.();
            }
        })
            .catch(handlePromiseError)
            .finally(() => (isUserMediaRequested.current = false));
    };
    const onCamSelect = async (selectedDeviceId, callback) => {
        const oldDeviceId = selectedDeviceId;
        // отображаем сразу для пользователя, что камера изменилась
        setCurrentCamId(selectedDeviceId);
        try {
            if (currentCamId && (!savedCam || savedCam.deviceId !== selectedDeviceId)) {
                debugMessage(DebugMessageType.LOG, {
                    message: 'changing cam id',
                    from: savedCam?.deviceId,
                    to: selectedDeviceId,
                });
                await SDK.changeDevice('videoinput', selectedDeviceId);
                setSavedCam(browser.getSavedCamera());
            }
        }
        catch (error) {
            debugMessage(DebugMessageType.ERROR, { message: 'Changing video input failed', error });
            // откатываем в случае ошибки смены камеры
            setCurrentCamId(oldDeviceId);
        }
        callback?.();
    };
    const onMicSelect = async (selectedDeviceId, callback) => {
        const oldDeviceId = selectedDeviceId;
        setCurrentMicId(selectedDeviceId);
        try {
            if (currentMicId && (!savedMic || savedMic.deviceId !== currentMicId)) {
                debugMessage(DebugMessageType.LOG, {
                    message: 'changing mic id',
                    from: savedMic?.deviceId,
                    to: selectedDeviceId,
                });
                await SDK.changeDevice('audioinput', selectedDeviceId);
            }
        }
        catch (error) {
            debugMessage(DebugMessageType.ERROR, { message: 'Changing audio input failed', error });
            setCurrentCamId(oldDeviceId);
        }
        callback?.();
    };
    const forceRefreshDevices = useCallback(() => {
        const mics = browser.getMicrophones();
        const cams = browser.getCameras();
        const savedMic = browser.getSavedMicrophone();
        const savedCam = browser.getSavedCamera();
        const selectedCamChangedAtSDK = !cams.map((cam) => cam?.deviceId).includes(currentCamId);
        if (selectedCamChangedAtSDK) {
            void onCamSelect(savedCam === null ? cams[0]?.deviceId : savedCam?.deviceId);
        }
        const selectedMicChangedAtSDK = !mics.map((mic) => mic?.deviceId).includes(currentMicId);
        if (selectedMicChangedAtSDK) {
            void onMicSelect(savedMic === null ? mics[0]?.deviceId : savedMic?.deviceId);
        }
        // всегда обновляем список доступных устройств
        setCameras(getAvailableDevices(cams));
        setMics(getAvailableDevices(mics));
    }, []);
    // получить информацию о доступных микрофонах и камерах
    useEffect(() => {
        (async () => {
            /**
             * В случае вызова useBrowserMedia после основной инициализации SDK, onDeviceChange будет заменён обработчиком, который не отправляет onDeviceChange подписчикам экземпляра CallsSdkServiceImpl
             * @todo: после полного перехода на DISdkService и/или в подписке на onDeviceChange через CallsSdkServiceImpl.subscribe появится необходимость - найти возможность передать CallsSdkServiceImpl.handleCallback в createDeviceChangeHandler
             */
            await SDK.init({
                onDeviceChange: createDeviceChangeHandler(),
            });
            const isCamAvailable = browser.hasCamera() && browser.hasCameraPermission();
            const isMicAvailable = browser.hasMicrophone() && browser.hasMicrophonePermission();
            setBrowserMedia({
                isCamAvailable,
                isMicAvailable,
            });
            const savedVideo = browser.getSavedCamera();
            const savedAudio = browser.getSavedMicrophone();
            setSavedCam(savedVideo);
            setSavedMic(savedAudio);
            const cameras = getAvailableDevices(browser.getCameras());
            const mics = getAvailableDevices(browser.getMicrophones());
            setCameras(cameras);
            setMics(mics);
            setCurrentCamId(isCamAvailable ? (savedVideo && savedVideo.deviceId) || cameras?.[0]?.deviceId : '');
            setCurrentMicId(isMicAvailable ? (savedAudio && savedAudio.deviceId) || mics?.[0]?.deviceId : '');
        })();
        eventBus.on(CallsEventType.DEVICE_CHANGED, forceRefreshDevices);
        return function cleanUp() {
            eventBus.off(CallsEventType.DEVICE_CHANGED, forceRefreshDevices);
        };
    }, [forceRefreshDevices]);
    return {
        browserMedia,
        currentCamId,
        currentMicId,
        getUserMedia,
        onCamSelect,
        onMicSelect,
        cameras,
        mics,
        savedCam,
        savedMic,
        forceRefreshDevices,
    };
}
//# sourceMappingURL=useBrowserMedia.js.map