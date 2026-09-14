import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}],"video":["global",{"className":1}],"Icon56VideocamSlashOutline":["@vkontakte/icons",{"className":1}],"CustomSelectOption":["@vkontakte-internal/vkcom-kit",{"className":2}],"span":["global",{"dangerouslySetInnerHTML":1}]} */
import { useEffect, useRef } from 'react';
import { VideoHeight, VideoWidth } from '../../constants';
import { EVideoOptionType, useVideoOptions } from '../../hooks/useVideoOptions';
import { classNames as cx } from '@vkontakte/vkjs';
import { browser, debugMessage, DebugMessageType } from '@vkontakte/calls-sdk';
import { Icon56VideocamSlashOutline } from '@vkontakte/icons';
import { CustomSelect, CustomSelectOption, FormItem, FormLayout, Group, Input, Separator, Spacing, } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
export function CallSettings({ cameras, mics, noiseCancellationOptions, videoResolutionOptions, currentCamId, currentMicId, currentNoiseCancellation, currentVideoResolution, isCamAvailable = false, isMicAvailable = false, onCameraChange, onMicChange, onNoiseCancellationChange, onVideoResolutionChange, isVoiceRoom, isVoiceRoomAudioMode, }) {
    const { getLang } = useLang();
    const videoElRef = useRef(null);
    const videoStreamRef = useRef(null);
    const mediaProps = {
        controls: false,
        crossOrigin: 'anonymous',
        playsInline: true,
    };
    useVideoOutput({
        currentVideoResolution,
        mediaElRef: videoElRef,
        streamRef: videoStreamRef,
        deviceId: currentCamId,
        isActive: isCamAvailable,
    });
    const { storedVideoOptions } = useVideoOptions();
    const showCamera = !isVoiceRoom || !isVoiceRoomAudioMode;
    return (_jsx("div", { className: "CallSettings", children: _jsxs(Group, { mode: "plain", children: [showCamera && (_jsx("div", { className: "CallSettings__camera", "data-testid": "calls_media_settings_camera", children: isCamAvailable ? (_jsx("video", { ref: videoElRef, ...mediaProps, className: cx({
                            CallSettings__cameraStream: storedVideoOptions[EVideoOptionType.IS_VIDEO_MIRRORED],
                        }, 'CallSettings__cameraContent') })) : (_jsxs("div", { className: cx('CallSettings__cameraStub', 'CallSettings__cameraContent'), children: [_jsx(Icon56VideocamSlashOutline, { className: "CallSettings__cameraStubIcon" }), getLang('calls_no_camera')] })) })), _jsxs(FormLayout, { mode: "horizontal", children: [showCamera && (_jsxs(_Fragment, { children: [_jsx(FormItem, { top: getLang('calls_settings_camera'), "data-testid": "calls_media_settings_field_camera", children: isCamAvailable ? (_jsx(CustomSelect, { options: cameras.map(transformDeviceIntoOption), value: currentCamId, onChange: (e) => onCameraChange(e.currentTarget.value) })) : (_jsx(Input, { value: getLang('calls_settings_no_camera'), disabled: true })) }), _jsx(FormItem, { top: getLang('calls_video_quality'), "data-testid": "calls_media_settings_field_video_quality", children: _jsx(CustomSelect, { options: videoResolutionOptions, value: currentVideoResolution, onChange: (e) => onVideoResolutionChange(e.currentTarget.value), renderOption: ({ option, ...restProps }) => (_jsx(CustomSelectOption, { ...restProps, className: "CallSettings__selectOption--multiline", description: option.description })), disabled: !isCamAvailable, multiline: true }) }), _jsx(Spacing, { size: 24, children: _jsx(Separator, {}) })] })), _jsx(FormItem, { top: getLang('calls_settings_mic'), "data-testid": "calls_media_settings_field_mic", children: isMicAvailable ? (_jsx(CustomSelect, { options: mics.map(transformDeviceIntoOption), value: currentMicId, onChange: (e) => onMicChange(e.currentTarget.value) })) : (_jsx(Input, { value: getLang('calls_settings_no_mic'), disabled: true })) }), _jsx(FormItem
                        // todo после влития задачи нужно будет убрать перенос строки из перевода и просто использовать строку
                        , { 
                            // todo после влития задачи нужно будет убрать перенос строки из перевода и просто использовать строку
                            top: _jsx("span", { dangerouslySetInnerHTML: {
                                    __html: getLang('calls_settings_noise'),
                                } }), "data-testid": "calls_media_settings_field_noise", children: isMicAvailable ? (_jsx(CustomSelect, { options: noiseCancellationOptions, value: currentNoiseCancellation, onChange: (e) => onNoiseCancellationChange(e.currentTarget.value), renderOption: ({ option, ...restProps }) => (_jsx(CustomSelectOption, { ...restProps, className: "CallSettings__selectOption--multiline", description: option.description })), multiline: true })) : (_jsx(Input, { value: getLang('calls_settings_no_mic'), disabled: true })) })] })] }) }));
}
function transformDeviceIntoOption(device) {
    return {
        value: device.deviceId,
        label: device.label,
    };
}
function useVideoOutput({ currentVideoResolution, mediaElRef, streamRef, deviceId, isActive, }) {
    const prevDeviceId = useRef(undefined);
    let resolution;
    if (currentVideoResolution) {
        resolution = {
            width: VideoWidth[currentVideoResolution] || VideoWidth.SD,
            height: VideoHeight[currentVideoResolution] || VideoHeight.SD,
        };
    }
    useEffect(() => {
        if (!isActive) {
            return;
        }
        (async function updateStream() {
            try {
                if (deviceId !== prevDeviceId.current) {
                    const stream = await browser.getUserVideo(deviceId, resolution);
                    /* stop previous stream */
                    streamRef.current?.getTracks().forEach((track) => track.stop());
                    const videoEl = mediaElRef.current;
                    if (videoEl) {
                        streamRef.current = stream;
                        videoEl.srcObject = stream;
                        videoEl.muted = true;
                        try {
                            await videoEl.play();
                        }
                        catch (error) {
                            debugMessage(DebugMessageType.ERROR, { error, stream });
                        }
                    }
                }
                else if (streamRef.current && resolution) {
                    await browser.setResolution(streamRef.current, resolution);
                }
                // updates last used device id
                prevDeviceId.current = deviceId;
            }
            catch (err) {
                debugMessage(DebugMessageType.ERROR, { err, deviceId, resolution });
            }
        })();
    }, [deviceId, isActive, currentVideoResolution]);
    useEffect(() => {
        return () => {
            const stream = streamRef.current;
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            const mediaEl = mediaElRef.current;
            if (mediaEl) {
                mediaEl.srcObject = null;
            }
        };
    }, []);
}
//# sourceMappingURL=CallSettings.js.map