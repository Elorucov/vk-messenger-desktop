import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"RichAvatar":["@vkontakte-internal/vkcom-kit",{"className":1}],"div":["global",{"className":2}],"Icon56PhoneOutline":["@vkontakte/icons",{"width":1,"height":1}],"img":["global",{"className":1}]} */
import { classNames as cx } from '@vkontakte/vkjs';
import { isChatOrChannel, isParticipantAnonym, isParticipantContact } from '../../helpers/participant';
import { CallPhotoNFT } from './CallPhotoNFT';
import { Icon28PhoneOutline, Icon56PhoneOutline } from '@vkontakte/icons';
import { useConfig } from '../../services/config';
import { RichAvatar, calcInitialsAvatarColor } from '@vkontakte-internal/vkcom-kit';
import { getIdForColorCalculation } from '../../helpers/user';
import { CallPhotoBadge } from './CallPhotoBadge';
const MiniAppAvatarSize = 88;
export const CallPhoto = ({ peerId, waves = false, size, photo, alt, letter, showCreatorBadge, showAdminBadge, className, isNFT, isOrator, isMiniApp = false, isElementVisible = true, }) => {
    const { anonymPhoto } = useConfig();
    const isAnonym = isParticipantAnonym(peerId);
    const isContact = isParticipantContact(peerId);
    const isChat = isChatOrChannel(peerId);
    const testIdSuffix = !isElementVisible ? '_hidden' : '_visible';
    if (!size && isMiniApp) {
        size = MiniAppAvatarSize;
    }
    const photoClassName = cx('CallPhoto', className, {
        'CallPhoto--waves': !!waves,
        [`CallPhoto--${size}`]: !!size,
    });
    /** (!) return */
    if (isNFT) {
        return (_jsx(CallPhotoNFT, { alt: alt, src: photo, showAdminBadge: showAdminBadge, showCreatorBadge: showCreatorBadge, size: size, className: photoClassName, dataTestId: `calls_call_photo_nft${testIdSuffix}` }));
    }
    const letterIcon = letter ?? String.fromCodePoint(alt.codePointAt(0) ?? 32).trim();
    let badge;
    if (showCreatorBadge || showAdminBadge) {
        badge = _jsx(CallPhotoBadge, { type: showCreatorBadge ? 'creator' : 'admin' });
    }
    if (isContact || (isAnonym && !anonymPhoto) || (isChat && !photo && letterIcon)) {
        return (_jsx(RichAvatar, { className: photoClassName, noBorder: true, "data-testid": `calls_conversation_no_photo${testIdSuffix}`, initials: letterIcon, size: size || 40, nft: false, gradientColor: calcInitialsAvatarColor(getIdForColorCalculation(peerId)), children: badge }));
    }
    badge &&= _jsx("div", { className: "CallPhoto__badge", children: badge });
    if (!photo) {
        return (_jsxs(_Fragment, { children: [_jsx("div", { className: "CallPhoto--defaultContainer", "data-testid": `calls_call_photo${testIdSuffix}`, children: isOrator ? _jsx(Icon56PhoneOutline, { width: 96, height: 96 }) : _jsx(Icon28PhoneOutline, {}) }), badge] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("img", { "data-testid": `calls_call_photo${testIdSuffix}${isAnonym ? '_anonym' : ''}`, src: photo, className: photoClassName, alt: alt, draggable: false }), badge] }));
};
//# sourceMappingURL=CallPhoto.js.map