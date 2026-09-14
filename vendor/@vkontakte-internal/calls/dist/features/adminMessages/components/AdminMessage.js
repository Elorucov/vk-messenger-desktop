import { jsx as _jsx } from "react/jsx-runtime";
import { RichAvatar, calcInitialsAvatarColor } from '@vkontakte-internal/vkcom-kit';
import { useCallback } from 'react';
import { CallsBanner, useControlledState } from '../../../components/CallsBanner';
import { useLang } from '../../../hooks/useLang';
import { getSingleLetter } from '../../../helpers/participant';
import { getIdForColorCalculation } from '../../../helpers/user';
const MESSAGE_NOTIFICATION_AVATAR_SIZE = 40;
const MESSAGE_NOTIFICATION_NFT_AVATAR_SIZE = 36;
export const AdminMessage = ({ message, onClose }) => {
    const { getLang } = useLang();
    const [isOpen, closeBanner] = useControlledState();
    const { isNft, peerId, photo, name } = message.author;
    const handleClose = useCallback(() => {
        onClose(message);
    }, [onClose, message]);
    return (_jsx(CallsBanner, { asideMode: "dismiss", autoDismissDelay: false, before: 
        // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
        _jsx(RichAvatar, { gradientColor: photo ? undefined : calcInitialsAvatarColor(getIdForColorCalculation(peerId)), initials: getSingleLetter(name), nft: isNft, size: isNft ? MESSAGE_NOTIFICATION_NFT_AVATAR_SIZE : MESSAGE_NOTIFICATION_AVATAR_SIZE, src: photo }), dismissLabel: getLang('calls_event_hide_button_text'), testId: "calls_admin_message", isOpen: isOpen, onDismiss: closeBanner, onExited: handleClose, noPadding: false, subheader: message.text }));
};
//# sourceMappingURL=AdminMessage.js.map