import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":7}],"article":["global",{"className":1}],"footer":["global",{"className":2}],"span":["global",{"className":2}],"Icon16MicrophoneSlash":["@vkontakte/icons",{"width":1,"height":1,"className":2}],"button":["global",{"className":1}],"Icon16Connection":["@vkontakte/icons",{"className":1}]} */
import { useRef, useState } from 'react';
import { BlurredBackground } from '../BlurredBackground/BlurredBackground';
import { Video } from '../Video/Video';
import { classNames as cx } from '@vkontakte/vkjs';
import { observer } from 'mobx-react-lite';
import CallingStatus from '../../components/CallingStatus/CallingStatus';
import { Icon16Connection, Icon16MicrophoneSlash, Icon56ArrowUpRectangleOutline } from '@vkontakte/icons';
import { CallPhoto } from '../CallPhoto/CallPhoto';
import { VideoSuspendReason } from '@vkontakte-internal/calls-core';
import { ParticipantHeader } from '../ParticipantHeader/ParticipantHeader';
import { getStreamModeIcon } from '../../utils/streamMode';
import { decodeHTMLEntities } from '@vkontakte-internal/vkjs/lib/emoji/HTMLEntities';
import { useLang } from '../../hooks/useLang';
import { VideoZoomControls, VideoZoomWrapper } from '../../features/videoZoom';
import { useParticipantViewModel } from './ParticipantViewModel';
export const ParticipantView = observer(function ParticipantView() {
    const { getLang } = useLang();
    const ref = useRef(null);
    const model = useParticipantViewModel();
    const { allowContain, externalId, id, isAudioEnabled, isHandRaised, isInfoShown, isInteractive, isMe, isMeMainScreenSharer, isMiniApp, isMirrored, isNFT, isMiniAppearance, isOratorAppearance, isPinned, isPinnedByAdmin, isSharingScreen, isWatchTogether, isShowVideo, isSpeaking, isVisible, isWaitingHallAppearance, letter, mediaStream, mediaType, name, networkStateColorClass, participantLabel, peerId, photo, photoSize, raisedHandLabel, reaction, reactions, shouldShowStatus, streamModes, videoSuspendReason, wasConnected, } = model;
    const [isVideoElementVisible, setIsVideoElementVisible] = useState(false);
    const classes = cx('Participant', 'Participant--withAnimation', {
        'Participant--isInteractive': isInteractive,
        'Participant--isPinned': isPinned,
        'Participant--isSpeaking': isSpeaking,
        'Participant--isOrator': isOratorAppearance,
        'CallBaseWidget__participant': isMiniAppearance,
        'WaitingHall__participant': isWaitingHallAppearance,
    });
    const photoClassName = cx({
        'Participant__offsetCard': isInfoShown,
        'Participant__oratorPhoto': isOratorAppearance,
        'Participant__oratorPhoto--nft': isNFT,
    });
    const callingStatusClassName = cx('Participant__status', {
        'Participant__status--miniApp': isMiniApp,
        'Participant__status--miniAppNft': isMiniApp && isNFT,
    });
    const participantVideoClassName = cx('Participant__main', {
        'Participant__main--video': !isOratorAppearance,
    });
    let articleLabel = participantLabel;
    if (isShowVideo) {
        articleLabel += `, ${getLang('calls_camera_on')}`;
    }
    if (!!networkStateColorClass) {
        articleLabel += `, ${getLang('calls_notification_bad_signal')}`;
    }
    return (_jsxs("div", { className: "Participant__wrapper", children: [_jsxs("article", { ref: ref, className: classes, onClick: model.handleClick, onDoubleClick: model.handleDblClick, "aria-label": articleLabel, "participant-id": id, tabIndex: isOratorAppearance ? -1 : 0, role: isInteractive ? 'button' : undefined, children: [!isVisible && (_jsxs(_Fragment, { children: [_jsx(BlurredBackground, { id: peerId, className: "Participant__main", children: _jsx(CallPhoto, { peerId: peerId, photo: photo, alt: participantLabel, letter: letter, className: photoClassName, isOrator: isOratorAppearance, size: !isNFT ? photoSize : undefined, isNFT: isNFT, isElementVisible: !isVideoElementVisible }) }), isInfoShown && (_jsxs("footer", { className: "Participant__footer", children: [_jsx("span", { className: "Participant__name", children: decodeHTMLEntities(name) }), (wasConnected || isMe) && !isAudioEnabled && (_jsx(Icon16MicrophoneSlash, { width: 16, height: 16, className: "Participant__statusIcon--mic" }))] }))] })), isVisible && (_jsxs(_Fragment, { children: [_jsx(BlurredBackground, { id: peerId, className: "Participant__main", children: _jsx(CallPhoto, { peerId: peerId, photo: photo, alt: name || '', letter: letter, className: photoClassName, isOrator: isOratorAppearance, isNFT: isNFT, size: !isNFT ? photoSize : undefined, isMiniApp: isMiniApp, isElementVisible: !isVideoElementVisible }) }), isMeMainScreenSharer && (_jsxs("div", { className: "Participant__screenSharer", children: [_jsx(Icon56ArrowUpRectangleOutline, {}), _jsx("div", { className: "Participant__screenSharerText", children: getLang('calls_you_are_screen_sharer') }), _jsx("button", { className: "Participant__screenSharerButton", onClick: model.handleStopScreenShare, children: getLang('calls_screen_share_stop') })] })), videoSuspendReason
                                ? videoSuspendReason === VideoSuspendReason.NETWORK && (
                                // By UI/UX decision we don't show label if video is suspended due to user settings
                                _jsx("div", { className: "Participant__videoSuspendedLabel", children: getLang('calls_video_suspended_by_network') }))
                                : mediaStream &&
                                    isShowVideo && (_jsx(VideoZoomWrapper, { children: _jsx(Video, { className: participantVideoClassName, participantId: id, stream: mediaStream, isMirrored: isMirrored, isContained: allowContain || isSharingScreen || isWatchTogether, isStartWithVisible: isMe, isLocalSchreenShare: isMe && isSharingScreen, setIsVideoElementVisible: setIsVideoElementVisible, mediaType: mediaType }) })), shouldShowStatus && (_jsx("div", { className: callingStatusClassName, children: _jsx(CallingStatus, { isInverted: true }) })), Boolean((!isOratorAppearance && isInfoShown) || isMiniApp) && (
                            // подвал карточки участника
                            _jsxs("footer", { className: "Participant__footer", children: [_jsx("div", { className: cx('Participant__indicators', 'Participant__indicators--footer'), children: streamModes?.map((type) => (_jsx("div", { className: cx('Participant__indicator', 'Participant__indicator--stream-mode'), children: getStreamModeIcon(type) }, type))) }), networkStateColorClass && _jsx(Icon16Connection, { className: networkStateColorClass }), _jsx("span", { className: cx('Participant__name', {
                                            'Participant__name--stream-modes': !!streamModes?.length,
                                            'Participant__name--bad-network': !!networkStateColorClass,
                                        }), children: decodeHTMLEntities(name) }), (wasConnected || isMe) && !isAudioEnabled && (_jsx(Icon16MicrophoneSlash, { className: "Participant__statusIcon--mic" }))] }))] }))] }), _jsx(ParticipantHeader, { externalId: externalId, isPinnedByAdmin: isPinnedByAdmin, isPinned: isPinned, isVisible: isVisible, isHandRaised: isHandRaised, reaction: reaction, reactions: reactions, raisedHandLabel: raisedHandLabel }), _jsx(VideoZoomControls, { className: "Participant__zoomControls" })] }));
});
//# sourceMappingURL=Participant.js.map