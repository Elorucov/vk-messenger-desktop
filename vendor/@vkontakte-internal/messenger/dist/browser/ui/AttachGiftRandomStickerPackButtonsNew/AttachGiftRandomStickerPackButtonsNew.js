import React from 'react';
import { Button, ButtonGroup } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import { useRouter } from '../../ui/Router/Router';
import { GIFTS_RANDOM_STICKER_PACK_GIFT_ID } from '../../../core/config/config';
import * as Peer from '../../../core/model/Peer';
import { createGiftSendMoreReferrer, createRandomPackGiftReferrer, createGiftReplyReferrer, } from '../../ui/AttachGift/helpers';
export const AttachGiftRandomStickerPackButtonsNew = ({ message, gift, }) => {
    const { lang } = useBrowserEnv();
    const { navigate } = useRouter();
    const { isOut, peerId } = message;
    if (isOut) {
        const handleSendMore = (event) => {
            event.stopPropagation();
            navigate({
                kind: 'GiftsCatalogProxyRoute',
                peerId: Peer.isUserPeerId(peerId) ? peerId : undefined,
                send: true,
                ref: createGiftSendMoreReferrer(gift.id),
            });
        };
        return (React.createElement(Button, { stretched: true, size: "s", onClick: handleSendMore }, lang.use('me_attaches_gift_send_more')));
    }
    const handleRandomStickerPackView = (event) => {
        event.stopPropagation();
        navigate({
            kind: 'StickerPackProxyRoute',
            stickerPackId: GIFTS_RANDOM_STICKER_PACK_GIFT_ID,
            stickerPackName: 'random',
            randomPackAttemptId: gift.randomStickerPackAttemptId,
            ref: createRandomPackGiftReferrer(),
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
    return (React.createElement(ButtonGroup, { gap: "s", mode: "vertical", stretched: true },
        React.createElement(Button, { size: "s", stretched: true, onClick: handleRandomStickerPackView }, lang.use('me_attaches_gift_random_sticker_pack_view')),
        React.createElement(Button, { size: "s", stretched: true, onClick: handleSendInReturn, mode: "link" }, lang.use('me_attaches_gift_send_in_return'))));
};
//# sourceMappingURL=AttachGiftRandomStickerPackButtonsNew.js.map