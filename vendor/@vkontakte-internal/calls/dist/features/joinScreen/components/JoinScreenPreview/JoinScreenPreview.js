import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":4}]} */
import { useEffect, useRef, useState } from 'react';
import { Icon24MicrophoneSlashColor, Icon24Videocam, Icon24VideocamSlashColor, Icon24Voice, } from '@vkontakte/icons';
import { Card, getColorClass, IconMicrophoneIndicator } from '@vkontakte-internal/vkcom-kit';
import { ProfileCell } from '../JoinScreenProfileCell/ProfileCell';
import { JoinScreenPlaceholder } from './JoinScreenPlaceholder';
import { JoinScreenVideo } from './JoinScreenVideo';
import { JoinScreenDevices } from './JoinScreenDevices';
import { MediaControls } from './MediaControls';
import { classNames } from '@vkontakte/vkjs';
import styles from './JoinScreenPreview.module.css';
import { ClickHouseEventType, useSendStatsService } from '../../../../stats/clickHouse';
import { useCallsBridge } from '@vkontakte-internal/calls-core';
import { useVideoOutput } from '../../hooks/useVideoOutput';
import { useBrowserMedia } from '../../hooks/useBrowserMedia';
import { useAudioOutput } from '../../../../hooks/useAudioOutput';
import { useLang } from '../../../../hooks/useLang';
const camButtonDropdownTestId = { 'data-testid': 'calls_preview_mic_devices_button' };
const micButtonDropdownTestId = { 'data-testid': 'calls_preview_mic_devices_button' };
const getDataTestid = (isEnabled, isCam) => {
    return {
        'data-testid': `calls_preview_${isEnabled ? 'disable' : 'enable'}_${isCam ? 'cam' : 'mic'}_button`,
    };
};
export const JoinScreenPreview = ({ onCallByNameClick, profile, isAnonym, insidePopup, onPreviewMediaSettingsChange, disableDevices, resetDisableDevices, isSferum, initialDevices: { isCamEnabled: isCamEnabledInitially = false, isMicEnabled: isMicEnabledInitially = false, }, callId, mediaLoading, setMediaLoading, }) => {
    const { browserMedia: { isCamAvailable, isMicAvailable }, getUserMedia, currentCamId, currentMicId, cameras, mics, onCamSelect, onMicSelect, forceRefreshDevices, } = useBrowserMedia();
    const bridge = useCallsBridge();
    const sendStats = useSendStatsService();
    const { getLang } = useLang();
    const videoElRef = useRef(null);
    const camControl = useRef(null);
    const micControl = useRef(null);
    const [isCamEnabled, setIsCamEnabled] = useState(isCamEnabledInitially);
    const [isMicEnabled, setIsMicEnabled] = useState(isMicEnabledInitially);
    const [isCamMenuShown, setIsCamMenuShown] = useState(false);
    const [isMicMenuShown, setIsMicMenuShown] = useState(false);
    // Turn off camera and mic after unmount
    useEffect(() => {
        return () => {
            setIsCamEnabled(false);
            setIsMicEnabled(false);
        };
    }, []);
    // will be deprecated after fully moving to modal windows for joining
    useEffect(() => {
        if (disableDevices) {
            setIsCamEnabled(false);
            setIsMicEnabled(false);
            setIsCamMenuShown(false);
            setIsMicMenuShown(false);
            onPreviewMediaSettingsChange({
                isCamEnabled: false,
                isMicEnabled: false,
            });
        }
    }, [disableDevices]);
    useVideoOutput({
        $video: videoElRef,
        deviceId: currentCamId,
        isActive: isCamEnabled,
        isSferum,
        setMediaLoading,
    });
    const { volumeLevel } = useAudioOutput({
        deviceId: currentMicId,
        isActive: isMicEnabled,
    });
    const toggleIsCamEnabled = async () => {
        if (bridge.isInActiveCall) {
            return;
        }
        else if (disableDevices) {
            resetDisableDevices();
        }
        if (!isCamAvailable) {
            // перезапросим настройки, если камера не включена. включать камеру не будем (не можем)
            await getUserMedia({
                needVideo: true,
                onSuccess: () => {
                    if (!isCamEnabled) {
                        setIsCamEnabled(true);
                        // сохраним информацию о состоянии включения медиа настроек для контейнера присоединения, чтобы при присоединении знать о текущем конфиге
                        onPreviewMediaSettingsChange({
                            isCamEnabled: !isCamEnabled,
                            isMicEnabled,
                        });
                    }
                    const isDeviceBecameEnabled = !isCamEnabled;
                    sendStats(isDeviceBecameEnabled
                        ? ClickHouseEventType.CALL_PREVIEW_CAMERA_ENABLED
                        : ClickHouseEventType.CALL_PREVIEW_CAMERA_DISABLED, {
                        session_id: callId,
                    });
                },
            });
            return;
        }
        // локально сохраняем состояние
        setIsCamEnabled(!isCamEnabled);
        // сохраним информацию о состоянии включения медиа настроек
        onPreviewMediaSettingsChange({
            isCamEnabled: !isCamEnabled,
            isMicEnabled,
        });
        sendStats(!isCamEnabled
            ? ClickHouseEventType.CALL_PREVIEW_CAMERA_ENABLED
            : ClickHouseEventType.CALL_PREVIEW_CAMERA_DISABLED, { session_id: callId });
    };
    const toggleIsMicEnabled = async () => {
        if (bridge.isInActiveCall) {
            return;
        }
        else if (disableDevices) {
            resetDisableDevices();
        }
        if (!isMicAvailable) {
            await getUserMedia({
                needAudio: true,
                onSuccess: () => {
                    if (!isMicEnabled) {
                        setIsMicEnabled(true);
                        onPreviewMediaSettingsChange({
                            isCamEnabled,
                            isMicEnabled: !isMicEnabled,
                        });
                    }
                    const isDeviceBecameEnabled = !isMicEnabled;
                    sendStats(isDeviceBecameEnabled
                        ? ClickHouseEventType.CALL_PREVIEW_MIC_ENABLED
                        : ClickHouseEventType.CALL_PREVIEW_MIC_DISABLED, {
                        session_id: callId,
                    });
                },
            });
            return;
        }
        setIsMicEnabled(!isMicEnabled);
        onPreviewMediaSettingsChange({
            isCamEnabled,
            isMicEnabled: !isMicEnabled,
        });
        const isDeviceBecameEnabled = !isMicEnabled;
        sendStats(isDeviceBecameEnabled
            ? ClickHouseEventType.CALL_PREVIEW_MIC_ENABLED
            : ClickHouseEventType.CALL_PREVIEW_MIC_DISABLED, {
            session_id: callId,
        });
    };
    const requestUserMedia = async (isVideo) => {
        if (isVideo && !isCamAvailable) {
            await getUserMedia({ needVideo: true });
            return;
        }
        if (!isVideo && !isMicAvailable) {
            await getUserMedia({ needAudio: true });
            return;
        }
    };
    const checkDisableDevices = () => {
        if (bridge.isInActiveCall) {
            return;
        }
        else if (disableDevices) {
            resetDisableDevices();
        }
    };
    const toggleCamMenuShown = async (shown) => {
        if (bridge.isInActiveCall) {
            return;
        }
        else if (disableDevices) {
            resetDisableDevices();
        }
        if (cameras.length === 0) {
            forceRefreshDevices();
        }
        await requestUserMedia(true);
        cameras.length && setIsCamMenuShown(shown);
    };
    const toggleMicMenuShown = async (shown) => {
        if (bridge.isInActiveCall) {
            return;
        }
        else if (disableDevices) {
            resetDisableDevices();
        }
        if (mics.length === 0) {
            forceRefreshDevices();
        }
        await requestUserMedia(false);
        mics.length && setIsMicMenuShown(shown);
    };
    const onCamChange = (selectedDeviceId) => {
        sendStats(ClickHouseEventType.CALL_PREVIEW_DEVICE_CHANGE_CAM_CLICK, {
            session_id: callId,
        });
        onCamSelect(selectedDeviceId, () => setIsCamMenuShown(false));
    };
    const onMicChange = (selectedDeviceId) => {
        sendStats(ClickHouseEventType.CALL_PREVIEW_DEVICE_CHANGE_MIC_CLICK, {
            session_id: callId,
        });
        onMicSelect(selectedDeviceId, () => setIsMicMenuShown(false));
    };
    const camButtonProps = {
        leftControl: (_jsx("div", { className: getColorClass('color_icon_contrast'), children: isCamEnabled ? (_jsx(Icon24Videocam, { ...getDataTestid(isCamEnabled, true) })) : (_jsx(Icon24VideocamSlashColor, { ...getDataTestid(isCamEnabled, true) })) })),
        leftControlAriaLabel: isCamEnabled ? getLang('calls_camera_turn_off') : getLang('calls_camera_turn_on'),
        rightControl: _jsx(MediaControls, { shown: isCamMenuShown }),
        disabled: !isCamAvailable || mediaLoading,
        rightControlAriaLabel: getLang('calls_choose_device'),
        onLeftControlClick: toggleIsCamEnabled,
        onRightControlClick: () => !isCamAvailable && toggleCamMenuShown(!isCamMenuShown),
        getRootRef: camControl,
        dropdown: {
            onShownChange: toggleCamMenuShown,
            devices: cameras,
            selectedDeviceId: currentCamId,
            onDeviceSelect: onCamChange,
            ...camButtonDropdownTestId,
        },
    };
    const micButtonProps = {
        leftControl: (_jsx("div", { className: classNames(getColorClass('color_icon_contrast'), styles.micIcon), children: isMicEnabled ? (_jsx(IconMicrophoneIndicator, { ...getDataTestid(isMicEnabled, false), activated: volumeLevel > 10, color: "color_icon_contrast", Icon: Icon24Voice, level: volumeLevel })) : (_jsx(Icon24MicrophoneSlashColor, { ...getDataTestid(isMicEnabled, false) })) })),
        leftControlAriaLabel: isMicEnabled ? getLang('calls_mic_turn_off') : getLang('calls_mic_turn_on'),
        rightControl: _jsx(MediaControls, { shown: isMicMenuShown }),
        disabled: !isMicAvailable || mediaLoading,
        rightControlAriaLabel: getLang('calls_choose_device'),
        onLeftControlClick: toggleIsMicEnabled,
        onRightControlClick: () => !isMicAvailable && toggleMicMenuShown(!isMicMenuShown),
        getRootRef: micControl,
        dropdown: {
            onShownChange: toggleMicMenuShown,
            devices: mics,
            selectedDeviceId: currentMicId,
            onDeviceSelect: onMicChange,
            ...micButtonDropdownTestId,
        },
    };
    const profileCallbacks = {
        onSelectProfileClick: onCallByNameClick,
    };
    const isVideoDisabled = !isCamAvailable || !isCamEnabled;
    const showProfileCell = Boolean(!isAnonym && profile?.profileName);
    return (_jsx("div", { className: classNames(styles.root, isAnonym && !insidePopup && styles.anonymousFlat, !isAnonym && insidePopup && styles.authorizedInPopup, !isAnonym && styles.authorized), children: _jsx(Card, { mode: "outline-tint", children: _jsxs("div", { className: classNames(styles.card, isAnonym && styles.cardAnonymous, insidePopup && styles.cardInPopup), children: [isVideoDisabled && _jsx(JoinScreenPlaceholder, { insidePopup: insidePopup }), _jsx(JoinScreenVideo, { isDisabled: isVideoDisabled, videoElRef: videoElRef }), _jsxs("div", { className: classNames(styles.controls, !showProfileCell && styles.controlsNoProfileData), children: [showProfileCell && _jsx(ProfileCell, { ...profile, ...profileCallbacks, withPopup: insidePopup }), _jsx(JoinScreenDevices, { camButtonProps: camButtonProps, micButtonProps: micButtonProps, isMicAvailable: isMicAvailable, isCamAvailable: isCamAvailable, isProfileLoaded: showProfileCell, disableDevices: disableDevices, checkDisableDevices: disableDevices ? checkDisableDevices : undefined })] })] }) }) }));
};
//# sourceMappingURL=JoinScreenPreview.js.map