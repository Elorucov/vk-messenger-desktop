import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}],"video":["global",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
import { useCurrentUserVideoElement } from './hooks/useCurrentUserVideoElement';
import { useCarouselItems } from './hooks/useCarouselItems';
import { useVideoEffects } from './hooks/useVideoEffects';
import { useUserMediaStream } from '../../hooks/useUserMediaStream';
import { BorderCornerIcon } from './BorderCornerIcon';
import { useLang } from '../../hooks/useLang';
import { EVideoOptionType } from '../../hooks/useVideoOptions';
import { CarouselItem } from './CarouselItem/CarouselItem';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const VirtualBackgroundSettings = ({ backgroundList, onDeleteBackground, onChooseBackground, chosen, videoOptions, isSferum, SDK, }) => {
    const { getLang } = useLang();
    const { userStream, error, updateUserMediaStream } = useUserMediaStream(SDK.browser.getUserVideo);
    const { $video } = useCurrentUserVideoElement({ userStream });
    const { onUpdateVideoEffectsSettings } = useVideoEffects({
        backgroundList,
        $video,
        userStream,
    });
    const { carouselItems } = useCarouselItems({
        backgroundList,
        onDeleteBackground,
        onUpdateVideoEffectsSettings,
        onChooseBackground,
        chosen,
        isSferum,
    });
    return (_jsxs("div", { className: "VirtualBackgroundSettings", children: [_jsxs("div", { className: "VirtualBackgroundSettings__userStream", children: [userStream && (_jsx("video", { className: cx('Video', 'Video--visible', 'Video--contain', {
                            'Video--mirrored': videoOptions[EVideoOptionType.IS_VIDEO_MIRRORED],
                        }), ref: $video, controls: false, crossOrigin: "anonymous", playsInline: true, muted: true, autoPlay: true, children: "Video tag is not supported" })), error && (_jsxs("div", { className: "VirtualBackgroundSettings__error", children: [_jsx("div", { children: getLang('profile_no_camera_access') }), _jsx("div", { children: _jsx(Button, { appearance: "overlay", mode: "secondary", size: "m", onClick: updateUserMediaStream, children: getLang('calls_button_allow_access') }) })] }))] }), _jsxs("div", { className: cx({
                    'VirtualBackgroundSettings__carousel__modalFix': true,
                    'VirtualBackgroundSettings__carousel__modalFix--sferum': isSferum,
                }), children: [_jsx("div", { className: "VirtualBackgroundSettings__carousel", children: carouselItems.map((item) => (_jsx(CarouselItem, { effect: item.effect, onClick: item.onClick, content: item.content }, item.effect.id))) }), _jsx(BorderCornerIcon, { className: "VirtualBackgroundSettings__carousel__cornerIcon" })] })] }));
};
//# sourceMappingURL=VirtualBackgroundSettings.js.map