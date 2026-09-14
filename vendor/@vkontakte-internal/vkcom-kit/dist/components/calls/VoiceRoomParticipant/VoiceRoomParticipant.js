import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"Icon16MicrophoneSlash":["@vkontakte/icons",{"className":1}]} */
import { Icon16MicrophoneSlash, Icon20StarCircleFillBlue, Icon20StarCircleFillGray } from '@vkontakte/icons';
import { HorizontalCell } from '../../Adopted';
import { DropdownActionSheet, } from '../../DropdownActionSheet/DropdownActionSheet';
import { RichAvatar } from '../../RichAvatar/RichAvatar';
import { TextClamp } from '../../TextClamp/TextClamp';
import { ParticipantActionsButton } from '../ParticipantActionsButton/ParticipantActionsButton';
import { VideoStream } from '../VideoStream/VideoStream';
import styles from './VoiceRoomParticipant.module.css';
export const VoiceRoomParticipant = ({ size, hasVideo, stream, videoId, userName, speaking, actions, nft, hasMicrophoneDisabledled, role, src, mirrored, dropdownActionType = 'hover', cellSize, children, gradientColor, reaction, }) => {
    const isVideoShown = hasVideo && stream !== null && stream !== undefined && videoId !== undefined;
    const badgeIcon = getBadgeIcon(role, reaction);
    return (_jsx(HorizontalCell, { hasHover: false, hasActive: false, header: _jsx("div", { className: styles.titleContainer, children: _jsxs("div", { className: styles.title, style: { width: size }, children: [typeof userName === 'string' ? _jsx(TextClamp, { lines: 1, children: userName }) : userName, hasMicrophoneDisabledled && _jsx(Icon16MicrophoneSlash, { className: styles.micIcon })] }) }), size: cellSize, noPadding: true, children: _jsx("div", { className: styles.root, children: _jsxs(RichAvatar, { src: src, size: size, initials: typeof userName === 'string' ? userName.charAt(0) : undefined, gradientColor: gradientColor, nft: Boolean(nft && !isVideoShown), children: [speaking && _jsx(RichAvatar.Outline, { appearance: "positive", noPadding: true }), badgeIcon && (_jsx(RichAvatar.Badge, { placement: "top-right", zIndex: 1, children: badgeIcon })), !!actions && (_jsx(RichAvatar.Badge, { className: styles.manageButton, placement: "top-right", zIndex: 2, children: _jsx(DropdownActionSheet, { content: actions, trigger: dropdownActionType, children: _jsx("div", { children: _jsx(ParticipantActionsButton, {}) }) }) })), isVideoShown && (_jsx(VideoStream, { className: styles.stream, mirrored: mirrored, stream: stream, videoId: videoId, width: size, height: size, shape: "circle" })), children] }) }) }));
};
function getBadgeIcon(role, reaction) {
    if (reaction) {
        // eslint-disable-next-line react/forbid-elements
        return _jsx("img", { src: reaction, alt: "reaction", className: styles.reaction });
    }
    switch (role) {
        case 'admin': {
            return _jsx(Icon20StarCircleFillGray, {});
        }
        case 'creator': {
            return _jsx(Icon20StarCircleFillBlue, {});
        }
        default: {
            return null;
        }
    }
}
//# sourceMappingURL=VoiceRoomParticipant.js.map