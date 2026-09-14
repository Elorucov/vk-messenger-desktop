import React from 'react';
import { Button, ButtonGroup } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import * as Peer from '../../../core/model/Peer';
import { useStickerPackOpener } from '../../hooks/useStickerPackOpener';
import { createGiftSendMoreReferrer, createGiftReplyReferrer, isPackForChoiceGift, isAnimatedPackForChoiceGift, } from '../../ui/AttachGift/helpers';
import { AttachGiftStatusButton } from './AttachGiftStatusButton';
import { AttachGiftStatusPackButton } from './AttachGiftStatusPackButton';
export const AttachGiftButtons = ({ message, gift }) => {
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const isStickerPack = gift.isStickerPack;
    const { openStickerPackInPicker, proxyRoute } = useStickerPackOpener({
        enabled: isStickerPack,
        stickerPackId: -gift.id,
        stickerId: undefined,
    });
    const { isOut, peerId } = message;
    const handleSendMore = (event) => {
        event.stopPropagation();
        navigate({
            kind: 'GiftsCatalogProxyRoute',
            peerId: Peer.isUserPeerId(peerId) ? peerId : undefined,
            ref: createGiftSendMoreReferrer(gift.id),
            send: true,
        });
    };
    const handleSendInReturn = (event) => {
        event.stopPropagation();
        navigate({
            kind: 'GiftsCatalogProxyRoute',
            peerId: Peer.isUserPeerId(peerId) ? peerId : undefined,
            send: true,
            ref: createGiftReplyReferrer(gift.id),
        });
    };
    const handleOpenMyGifts = (event) => {
        event.stopPropagation();
        navigate({
            kind: 'AttachProxyRoute',
            attach: gift,
        });
    };
    const handleOpenStickerPack = (event) => {
        event.stopPropagation();
        if (openStickerPackInPicker) {
            openStickerPackInPicker();
            return;
        }
        if (proxyRoute) {
            navigate(proxyRoute);
        }
    };
    const getSecondaryButton = (link) => {
        return isOut ? (React.createElement(Button, { size: "s", stretched: true, onClick: handleSendMore, mode: link ? 'link' : undefined }, lang.use('me_attaches_gift_send_more'))) : (React.createElement(Button, { size: "s", stretched: true, onClick: handleSendInReturn, mode: "link" }, lang.use('me_attaches_gift_send_in_return')));
    };
    if (gift.type === 'image_status' || gift.type === 'image_status_pack') {
        return (React.createElement(ButtonGroup, { gap: "s", mode: "vertical", stretched: true },
            gift.type === 'image_status' ? (React.createElement(AttachGiftStatusButton, { gift: gift, message: message })) : (React.createElement(AttachGiftStatusPackButton, { gift: gift, message: message })),
            getSecondaryButton(true)));
    }
    if (isStickerPack) {
        return (React.createElement(ButtonGroup, { gap: "s", mode: "vertical", stretched: true },
            React.createElement(Button, { size: "s", stretched: true, onClick: handleOpenStickerPack, loading: !openStickerPackInPicker && !proxyRoute }, lang.use('me_gift_snippet_button_show_pack')),
            getSecondaryButton(true)));
    }
    const handleOpenStickersStore = () => {
        navigate({
            kind: 'StickersStoreProxyRoute',
        });
    };
    const getPrimaryButton = () => {
        if (isOut) {
            return null;
        }
        if (isPackForChoiceGift(gift) || isAnimatedPackForChoiceGift(gift)) {
            return (React.createElement(Button, { size: "s", stretched: true, onClick: handleOpenStickersStore }, lang.use('me_gift_snippet_button_choose_stickers')));
        }
        return (React.createElement(Button, { size: "s", stretched: true, onClick: handleOpenMyGifts }, lang.use('me_gift_snippet_button_my_gifts')));
    };
    return (React.createElement(ButtonGroup, { gap: "s", mode: "vertical", stretched: true },
        getPrimaryButton(),
        getSecondaryButton(!isOut)));
};
//# sourceMappingURL=AttachGiftButtons.js.map