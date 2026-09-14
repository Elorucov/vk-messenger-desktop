import React, { useCallback, useState, useReducer, useRef, useEffect, } from 'react';
import { ModalInterface } from '../../ui/ModalInterface/ModalInterface';
import { Button, Input, IconButton, Footer, Spinner } from '@vkontakte/vkui';
import '../../ui/CaptchaModal/CaptchaModal.css';
import { LayerProvider } from '../../ui/Layer/Layer';
import { Icon24Headphones, Icon24Refresh, Icon24TextOutline, Icon36SoundWaveOutline, Icon40PlayCircle, } from '@vkontakte/icons';
import { getCaptchaLink } from './utils';
import { useCountdown } from '../../ui/CaptchaModal/useCountdown';
import { classNames as cx } from '@vkontakte/vkjs';
import { nanoid } from 'nanoid';
export const CaptchaModal = ({ onCaptcha, data, lang, modalRoot, deviceId, onClose, }) => {
    const [code, setCode] = useState('');
    const [hash, setHash] = useState(nanoid());
    const [swapTypeCount, updateSwapTypeCount] = useReducer((x) => ++x, 0);
    const [hasError, setError] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [captchaInfo, setCaptchaInfo] = useState({
        type: 'image',
        link: getCaptchaLink({
            deviceId,
            sid: data.captcha_sid,
            swapCount: swapTypeCount,
            type: 'image',
            isFirst: true,
            hash,
            captchaImage: data.captcha_img,
            captchaTrack: data.captcha_track,
        }),
    });
    const [canRefresh, setCanRefresh] = useState(true);
    const handleTimerStart = useCallback(() => setCanRefresh(false), []);
    const handleTimerEnd = useCallback(() => setCanRefresh(true), []);
    const { currentTime, start } = useCountdown({
        time: 5,
        onStart: handleTimerStart,
        onTimeOver: handleTimerEnd,
    });
    const onCodeChange = (event) => {
        setCode(event.target.value);
    };
    const cancel = () => {
        onCaptcha(null);
        onClose();
    };
    const send = () => {
        onCaptcha({ key: code, isAudio: captchaInfo.type === 'audio' });
        onClose();
    };
    const handleReload = useCallback(() => {
        const newHash = nanoid();
        setCaptchaInfo((prev) => ({
            ...prev,
            link: getCaptchaLink({
                deviceId,
                sid: data.captcha_sid,
                swapCount: swapTypeCount,
                type: prev.type,
                hash: newHash,
                isRefresh: true,
                captchaImage: data.captcha_img,
                captchaTrack: data.captcha_track,
            }),
        }));
        setHash(newHash);
    }, [
        data.captcha_img,
        data.captcha_sid,
        data.captcha_track,
        deviceId,
        swapTypeCount,
    ]);
    const handleRefresh = () => {
        handleReload();
        start();
    };
    const handleTypeChange = () => {
        updateSwapTypeCount();
        setCaptchaInfo((prev) => {
            const nextType = prev.type === 'audio' ? 'image' : 'audio';
            return {
                type: nextType,
                link: getCaptchaLink({
                    deviceId,
                    sid: data.captcha_sid,
                    swapCount: swapTypeCount + 1,
                    type: nextType,
                    hash,
                    captchaImage: data.captcha_img,
                    captchaTrack: data.captcha_track,
                }),
            };
        });
    };
    const handleError = useCallback(() => {
        setError(true);
        setLoading(false);
    }, []);
    const handleLoading = useCallback(() => {
        setError(false);
        setLoading(true);
    }, []);
    const handleLoaded = useCallback(() => setLoading(false), []);
    return (React.createElement(LayerProvider, { layer: modalRoot },
        React.createElement(ModalInterface, { title: lang.use('me_captcha_modal_title'), onClose: cancel, closeLabel: lang.use('me_close'), withCustomLayout: true },
            React.createElement("div", { className: "Captcha" },
                React.createElement("div", { className: "Captcha__content" },
                    React.createElement("div", { className: "Captcha__container" },
                        isLoading && (React.createElement("div", { className: "Captcha__loader" },
                            React.createElement(Spinner, null))),
                        hasError && (React.createElement(CaptchaLoadingError, { type: captchaInfo.type, lang: lang, onReload: handleReload })),
                        React.createElement("div", { className: cx('Captcha__captcha', {
                                'Captcha__captcha--hidden': hasError,
                            }) },
                            captchaInfo.type === 'image' && (React.createElement(CaptchaImage, { src: captchaInfo.link, lang: lang, onError: handleError, onLoading: handleLoading, onLoaded: handleLoaded })),
                            captchaInfo.type === 'audio' && (React.createElement(CaptchaAudio, { src: captchaInfo.link, lang: lang, onError: handleError, onLoading: handleLoading, onLoaded: handleLoaded })))),
                    React.createElement("div", { className: "Captcha__controls" },
                        data.is_refresh_enabled && (React.createElement(Button, { size: "m", appearance: "neutral", mode: "tertiary", disabled: !canRefresh, before: React.createElement(Icon24Refresh, { color: "var(--vkui--color_icon_secondary)" }), onClick: handleRefresh, "aria-label": captchaInfo.type === 'image'
                                ? lang.use('me_captcha_modal_refresh_aria_label')
                                : lang.use('me_captcha_modal_refresh_audio_aria_label'), tabIndex: 0 }, canRefresh
                            ? lang.use('me_captcha_modal_refresh')
                            : lang.use('me_captcha_modal_refresh_timeout', {
                                values: { sec: currentTime.toString() },
                            }))),
                        data.is_sound_captcha_available && (React.createElement(Button, { size: "m", appearance: "neutral", mode: "tertiary", before: captchaInfo.type === 'image' ? (React.createElement(Icon24Headphones, { color: "var(--vkui--color_icon_secondary)" })) : (React.createElement(Icon24TextOutline, { color: "var(--vkui--color_icon_secondary)" })), onClick: handleTypeChange, "aria-label": captchaInfo.type === 'image'
                                ? lang.use('me_captcha_modal_enable_audio_aria_label')
                                : lang.use('me_captcha_modal_enable_image_aria_label'), tabIndex: 0 }))),
                    React.createElement("form", { className: "Captcha__form", onSubmit: (e) => {
                            // Не даем странице перегружаться.
                            e.preventDefault();
                            if (!code) {
                                return;
                            }
                            send();
                        } },
                        React.createElement(Input, { className: "Captcha__input", placeholder: captchaInfo.type === 'image'
                                ? lang.use('me_captcha_modal_input_placeholder')
                                : lang.use('me_captcha_modal_input_placeholder_audio'), onChange: onCodeChange, value: code }),
                        React.createElement(Button, { disabled: !code, stretched: true, size: "l", type: "submit" }, lang.use('me_send'))))))));
};
const CaptchaImage = ({ src, lang, onError, onLoading, onLoaded, }) => {
    const $image = useRef(null);
    useEffect(() => {
        const imgEl = $image.current;
        if (imgEl) {
            imgEl.tabIndex = 0;
            imgEl.focus();
        }
    }, []);
    useEffect(() => {
        onLoading();
    }, [onLoading, src]);
    return (React.createElement("img", { src: src, height: "124", width: "100%", alt: lang.use('me_captcha_modal_image'), "aria-label": lang.use('me_captcha_modal_image'), onError: onError, onLoad: onLoaded, ref: $image }));
};
const CaptchaAudio = ({ src, lang, onError, onLoading, onLoaded, }) => {
    const $audio = useRef(null);
    const $playBtn = useRef(null);
    const [isPlaying, setPlaying] = useState(false);
    const handlePlayClick = () => {
        try {
            $audio.current?.play();
        }
        catch { }
    };
    useEffect(() => {
        handlePlayClick();
    }, [src]);
    return (React.createElement("div", { className: "Captcha__audio" },
        React.createElement(AudioWave, { side: "left", active: isPlaying }),
        React.createElement(IconButton, { size: 52, label: lang.use('me_captcha_modal_play_audio_button_aria_label'), onClick: handlePlayClick, type: "button", disabled: isPlaying, getRootRef: $playBtn },
            React.createElement(Icon40PlayCircle, null)),
        React.createElement(AudioWave, { side: "right", active: isPlaying }),
        React.createElement("audio", { src: src, ref: $audio, className: "Captcha__audioTrack", onPlay: () => setPlaying(true), onEnded: () => setPlaying(false), onError: onError, onLoadStart: onLoading, onLoadedData: onLoaded })));
};
const AudioWave = ({ side, active = false }) => {
    return (React.createElement("div", { className: cx('Captcha__audioWave', `Captcha__audioWave--${side}`, {
            'Captcha__audioWave--active': active,
        }) },
        React.createElement(Icon36SoundWaveOutline, null),
        React.createElement(Icon36SoundWaveOutline, null)));
};
const CaptchaLoadingError = ({ type, lang, onReload, }) => {
    return (React.createElement(Footer, null,
        type === 'image'
            ? lang.use('me_captcha_modal_loading_error_caption')
            : lang.use('me_captcha_modal_audio_loading_error_caption'),
        React.createElement("button", { type: "button", onClick: onReload, className: "Captcha__reloadBtn" }, lang.use('me_captcha_modal_loading_error_refresh_text'))));
};
//# sourceMappingURL=CaptchaModal.js.map