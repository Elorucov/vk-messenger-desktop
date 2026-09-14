import React from 'react';
import { useModal } from '../../hooks/useModal';
import { StickerRich } from '@vkontakte-internal/sticker';
import { AgeRestrictionModal, ChatRestrictionModal, } from '../../ui/AttachUGCSticker/RestrictionModals';
import { LangPackProvider } from '@vkontakte-internal/langs';
import { useBrowserEnv } from '../../hooks/misc';
import './AttachUGCSticker.css';
import { useStickerPackOpener } from '../../hooks/useStickerPackOpener';
import cx from 'classnames';
const LANG_PACK_NAME = 'stickers_kit';
const isRestricted = ({ active_restriction, status, is_deleted, is_claimed, }) => active_restriction === 'age_18' ||
    status === 'banned' ||
    status === 'rejected' ||
    is_deleted ||
    is_claimed;
export const AttachUGCSticker = ({ ugcSticker, forwarded, iconPosition, iconClassName, size, openStickerPackOnClick = true, }) => {
    const { vkDomain } = useBrowserEnv();
    const ageRestrictionModal = useModal();
    const chatRestrictionModal = useModal();
    const { openStickerPackInPicker } = useStickerPackOpener({
        enabled: openStickerPackOnClick && !isRestricted(ugcSticker.item),
        isUGC: true,
        stickerId: ugcSticker.id,
        stickerPackId: ugcSticker.item.pack_id,
    });
    const handleRestriction = (forwarded === true && chatRestrictionModal.open) ||
        (ugcSticker.item.active_restriction === 'age_18' &&
            ageRestrictionModal.open) ||
        undefined;
    const onClick = openStickerPackOnClick
        ? handleRestriction || openStickerPackInPicker
        : undefined;
    const stickerComponent = (React.createElement(StickerRich, { baseStickerProps: {
            sticker: ugcSticker.item,
            plain: true,
            size,
            onClick,
        }, wrapperProps: {
            contentClassName: iconClassName,
            iconPosition,
        } }));
    if (isRestricted(ugcSticker.item)) {
        return (React.createElement(LangPackProvider, { domain: vkDomain, name: LANG_PACK_NAME, suspense: false },
            React.createElement("div", { className: cx('AttachUGCSticker', {
                    'AttachUGCSticker--clickable': onClick,
                }), onClick: (e) => onClick && e.stopPropagation() },
                stickerComponent,
                ageRestrictionModal.isActive && (React.createElement(AgeRestrictionModal, { onClose: ageRestrictionModal.close })),
                chatRestrictionModal.isActive && (React.createElement(ChatRestrictionModal, { onClose: chatRestrictionModal.close })))));
    }
    return (React.createElement("div", { className: cx('AttachUGCSticker', {
            'AttachUGCSticker--clickable': onClick,
        }), onClick: (e) => onClick && e.stopPropagation() },
        stickerComponent,
        chatRestrictionModal.isActive && (React.createElement(ChatRestrictionModal, { onClose: chatRestrictionModal.close }))));
};
//# sourceMappingURL=AttachUGCSticker.js.map