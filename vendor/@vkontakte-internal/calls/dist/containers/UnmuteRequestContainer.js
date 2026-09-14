import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { MuteControlModal } from '../components/MuteControlModal/MuteControlModal';
import { useTypedDispatch } from '../hooks/useTypedDispatch';
import { useTypedSelector } from '../hooks/useTypedSelector';
import { E_ACTION } from '../constants';
import { ClickHouseEventType, NotificationType, UnmuteModalRequestType, hasIn, } from '@vkontakte-internal/calls-core';
import { useCallsSDK } from '../providers/CallsSdkProvider';
import { handlePromiseError } from '../helpers/logger';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../hooks/useLang';
import { useCloseModal } from '../hooks/useCloseModal';
import { useSendStatsService } from '../stats/clickHouse';
import { getVideoResolutionStatsValue } from '../helpers/videoSettingsStat';
import { useConfig } from '../services/config';
export const UnmuteRequestContainer = ({ requestType }) => {
    const SDK = useCallsSDK();
    const sendStats = useSendStatsService();
    const dispatch = useTypedDispatch();
    const { getLang } = useLang();
    const { enableHDVideo } = useConfig();
    const participantMe = useTypedSelector((state) => state.localDevice);
    const notification = useTypedSelector((state) => state.notification);
    const localVideoResolution = useTypedSelector((state) => state.localVideoResolution);
    const isUnmuteVideoBtn = hasIn(requestType, UnmuteModalRequestType.BOTH, UnmuteModalRequestType.VIDEO);
    const isUnmuteAudioBtn = hasIn(requestType, UnmuteModalRequestType.BOTH, UnmuteModalRequestType.AUDIO);
    const closeModal = useCloseModal();
    const unmuteAudio = async () => {
        try {
            const { mediaSettings } = participantMe;
            // Если у участника уже включено аудио, ничего не делаем.
            if (mediaSettings?.isAudioEnabled) {
                return;
            }
            if (notification?.type === NotificationType.SPEAKING_ON_MUTE) {
                dispatch({
                    type: E_ACTION.CALL_NOTIFICATION,
                    notification: null,
                });
            }
            await SDK.toggleLocalAudio(true);
        }
        catch (error) {
            handlePromiseError(error);
        }
    };
    const unmuteVideo = async () => {
        try {
            const { mediaSettings } = participantMe;
            // Если у участника уже включено видео (или скриншара для старого меню), ничего не делаем.
            if (mediaSettings?.isVideoEnabled || mediaSettings?.isScreenSharingEnabled) {
                return;
            }
            await SDK.toggleLocalVideo(true);
            sendStats(ClickHouseEventType.VIDEO_ENABLED);
            sendStats(ClickHouseEventType.VIDEO_SETTINGS, {
                reason: getVideoResolutionStatsValue(enableHDVideo, localVideoResolution),
            });
        }
        catch (error) {
            handlePromiseError(error);
        }
    };
    const unmuteMicOnly = async () => {
        closeModal();
        await unmuteAudio();
    };
    const unmuteMicAndCamera = async () => {
        closeModal();
        await unmuteAudio();
        await unmuteVideo();
    };
    const unmuteCameraOnly = async () => {
        closeModal();
        await unmuteVideo();
    };
    const options = useMemo(() => {
        let title = '';
        let desc = '';
        const actions = [];
        if (isUnmuteVideoBtn && isUnmuteAudioBtn) {
            title = getLang('calls_dialog_unmute_request_audio_and_video_title');
            desc = getLang('calls_dialog_unmute_request_audio_and_video_description');
            actions.push(_jsx(Button, { "data-focus-first": true, size: "m", onClick: unmuteMicOnly, mode: "secondary", children: getLang('calls_dialog_unmute_request_mic_only_action') }, "mic"), _jsx(Button, { size: "m", mode: "primary", onClick: unmuteMicAndCamera, children: getLang('calls_dialog_unmute_request_action') }, "all"));
        }
        else if (isUnmuteAudioBtn) {
            title = getLang('calls_dialog_unmute_request_audio_title');
            desc = getLang('calls_dialog_unmute_request_audio_description');
            actions.push(_jsx(Button, { "data-focus-first": true, size: "m", mode: "primary", onClick: unmuteMicOnly, children: getLang('calls_dialog_unmute_request_mic_action') }, "mic"));
        }
        else if (isUnmuteVideoBtn) {
            title = getLang('calls_dialog_unmute_request_video_title');
            desc = getLang('calls_dialog_unmute_request_video_description');
            actions.push(_jsx(Button, { "data-focus-first": true, size: "m", mode: "primary", onClick: unmuteCameraOnly, children: getLang('calls_dialog_unmute_request_camera_only_action') }, "video"));
        }
        return { actions, title, desc };
    }, [isUnmuteVideoBtn, isUnmuteAudioBtn, getLang, localVideoResolution]);
    return (_jsx(MuteControlModal, { onClose: closeModal, title: options.title, description: options.desc, actionButtons: options.actions, isAlertDialog: true }));
};
//# sourceMappingURL=UnmuteRequestContainer.js.map