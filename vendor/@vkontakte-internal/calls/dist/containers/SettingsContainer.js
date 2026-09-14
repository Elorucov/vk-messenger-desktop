import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useRef, useState } from 'react';
import { localStorage } from '@vkontakte/vkjs';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { CallSettings } from '../components/CallSettings/CallSettings';
import { CallSettingsModal } from '../components/CallSettingsModal/CallSettingsModal';
import { E_ACTION, VIDEO_RESOLUTION_STORAGE_KEY, VideoHeight, VideoWidth, } from '../constants';
import { ClickHouseEventType, EVideoOptionType, NoiseCancellationTypes, VideoResolutionTypes, } from '@vkontakte-internal/calls-core';
import { useLang } from '../hooks/useLang';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { getMediaModifiers } from '../helpers/call';
import { videoOptionsStorage } from '../helpers/localStorage';
import { getEffectVoiceChange, getIsVoiceRoom, getLocalVideoResolution, getNoiseCancellation, } from '../selectors';
import { getVoiceRoomIsAudioMode } from '../features/voiceRoom';
import { useConfig } from '../services/config';
import { useCloseModal } from '../hooks/useCloseModal';
import { updateClientDenoiser } from '../services/effectVoiceChange';
import { useSendStatsService } from '../stats/clickHouse';
import { getVideoResolutionStatsValue } from '../helpers/videoSettingsStat';
export function SettingsContainer() {
    const SDK = useCallsSDK();
    const sendStats = useSendStatsService();
    const { getLang } = useLang();
    const { fullHD, noiseReductionMode, enableNoiseReductionMode, enableClientNoiseReductionMode, enableHDVideo, } = useConfig();
    const noiseCancellation = useTypedSelector(getNoiseCancellation);
    const localVideoResolution = useTypedSelector(getLocalVideoResolution);
    const isVoiceRoomAudioMode = useTypedSelector(getVoiceRoomIsAudioMode);
    const effectVoiceChange = useTypedSelector(getEffectVoiceChange);
    const isVoiceRoom = useTypedSelector(getIsVoiceRoom);
    const dispatch = useTypedDispatch();
    const { noiseCancellationModesByType } = getMediaModifiers({
        noiseReductionMode,
        enableNoiseReductionMode,
    });
    const noiseCancellationOptions = useMemo(() => {
        const autoNoiseReducerType = enableClientNoiseReductionMode
            ? NoiseCancellationTypes.CLIENT
            : NoiseCancellationTypes.NEURAL;
        return [
            {
                label: getLang('calls_noise_neural'), // Авто
                value: autoNoiseReducerType,
                data: noiseCancellationModesByType[autoNoiseReducerType],
                description: getLang('calls_settings_noise_auto_desc'),
            },
            {
                label: getLang('calls_noise_simple'), // Слабое
                value: NoiseCancellationTypes.SIMPLE,
                data: noiseCancellationModesByType[NoiseCancellationTypes.SIMPLE],
            },
            {
                label: getLang('calls_neuter_disabled'), // Отключено
                value: NoiseCancellationTypes.NONE,
                data: noiseCancellationModesByType[NoiseCancellationTypes.NONE],
            },
        ];
    }, [getLang]);
    const videoResolutionOptions = useMemo(() => {
        const result = [
            {
                label: getLang('calls_video_quality_high'),
                value: VideoResolutionTypes.HD,
                description: getLang('calls_video_quality_high_desc'),
            },
            {
                label: getLang('calls_video_quality_optimal'),
                value: VideoResolutionTypes.SD,
                description: getLang('calls_video_quality_optimal_desc'),
            },
        ];
        if (fullHD) {
            result.push({
                label: getLang('calls_video_resolution_fhd'),
                value: VideoResolutionTypes.FHD,
            });
        }
        return result;
    }, [getLang, fullHD]);
    const cameras = SDK.browser.getCameras();
    const mics = SDK.browser.getMicrophones();
    const isCamAvailable = SDK.browser.hasCamera() && SDK.browser.hasCameraPermission();
    const isMicAvailable = SDK.browser.hasMicrophone() && SDK.browser.hasMicrophonePermission();
    const savedCam = SDK.browser.getSavedCamera();
    const savedMic = SDK.browser.getSavedMicrophone();
    const startCamId = isCamAvailable ? (savedCam && savedCam.deviceId) || cameras[0].deviceId : undefined;
    const startMicId = isMicAvailable ? (savedMic && savedMic.deviceId) || mics[0].deviceId : undefined;
    const [currentCamId, setCurrentCamId] = useState(startCamId);
    const [currentMicId, setCurrentMicId] = useState(startMicId);
    const [currentNoiseCancellation, setCurrentNoiseCancellation] = useState(noiseCancellation);
    const [currentVideoResolution, setCurrentVideoResolution] = useState(getVideoResolution(enableHDVideo));
    const closeModal = useCloseModal();
    /** флаг, что идет попытка сохранения настроек */
    const settingsLoading = useRef(false);
    const handleSubmit = async () => {
        if (settingsLoading.current) {
            return;
        }
        // уже не выключаем, тк окно будет закрыто и компонент будет размонтирован
        settingsLoading.current = true;
        try {
            if (currentCamId && (!savedCam || savedCam.deviceId !== currentCamId)) {
                debugMessage(DebugMessageType.LOG, {
                    message: 'changing cam id',
                    from: savedCam?.deviceId,
                    to: currentCamId,
                });
                await SDK.changeDevice('videoinput', currentCamId);
            }
            if (currentMicId && (!savedMic || savedMic.deviceId !== currentMicId)) {
                debugMessage(DebugMessageType.LOG, {
                    message: 'changing mic id',
                    from: savedMic?.deviceId,
                    to: currentMicId,
                });
                await SDK.changeDevice('audioinput', currentMicId);
            }
            if (noiseCancellation !== currentNoiseCancellation) {
                const mediaModifiers = noiseCancellationOptions.find((option) => {
                    return option.value === currentNoiseCancellation;
                })?.data || noiseCancellationModesByType[NoiseCancellationTypes.NEURAL];
                debugMessage(DebugMessageType.LOG, { message: 'changing mediaModifiers', to: mediaModifiers });
                videoOptionsStorage.saveOption(EVideoOptionType.NOISE_CANCELLATION_MODE, currentNoiseCancellation);
                await SDK.setMediaModifiers(mediaModifiers);
                await updateClientDenoiser(enableClientNoiseReductionMode, currentNoiseCancellation, noiseCancellationModesByType, effectVoiceChange, dispatch);
                dispatch({ type: E_ACTION.SET_NOISE_CANCELLATION, data: currentNoiseCancellation });
            }
            if (localVideoResolution !== currentVideoResolution) {
                const w = VideoWidth[currentVideoResolution];
                const h = VideoHeight[currentVideoResolution];
                debugMessage(DebugMessageType.LOG, {
                    message: 'changing video resolution',
                    from: localVideoResolution,
                    to: currentVideoResolution,
                    w,
                    h,
                });
                await SDK.setLocalResolution({ video: { width: w, height: h }, effect: { width: w, height: h } });
                localStorage.setItem(VIDEO_RESOLUTION_STORAGE_KEY, currentVideoResolution);
                dispatch({ type: E_ACTION.CHANGE_LOCAL_VIDEO_RESOLUTION, data: currentVideoResolution });
                sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                    reason: getVideoResolutionStatsValue(enableHDVideo, currentVideoResolution),
                });
            }
        }
        catch (error) {
            debugMessage(DebugMessageType.ERROR, { message: 'Saving video settings failed', error });
        }
        finally {
            closeModal();
        }
    };
    return (_jsx(CallSettingsModal, { onClose: closeModal, onSubmit: handleSubmit, children: _jsx(CallSettings, { mics: mics, cameras: cameras, noiseCancellationOptions: noiseCancellationOptions, videoResolutionOptions: videoResolutionOptions, currentCamId: currentCamId, currentMicId: currentMicId, currentNoiseCancellation: currentNoiseCancellation, currentVideoResolution: currentVideoResolution, isCamAvailable: isCamAvailable, isMicAvailable: isMicAvailable, onCameraChange: setCurrentCamId, onMicChange: setCurrentMicId, onNoiseCancellationChange: (noiseCancellationType) => setCurrentNoiseCancellation(noiseCancellationType), onVideoResolutionChange: (videoResolutionType) => setCurrentVideoResolution(videoResolutionType), isVoiceRoom: isVoiceRoom, isVoiceRoomAudioMode: isVoiceRoomAudioMode }) }));
}
function getVideoResolution(enableHDVideo) {
    const typeKey = localStorage.getItem(VIDEO_RESOLUTION_STORAGE_KEY);
    switch (typeKey) {
        case VideoResolutionTypes.FHD:
        case VideoResolutionTypes.HD:
        case VideoResolutionTypes.SD: {
            return typeKey;
        }
        default: {
            return enableHDVideo ? VideoResolutionTypes.HD : VideoResolutionTypes.SD;
        }
    }
}
//# sourceMappingURL=SettingsContainer.js.map