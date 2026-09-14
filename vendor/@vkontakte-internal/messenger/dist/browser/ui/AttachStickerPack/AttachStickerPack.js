import React from 'react';
import { useRouter } from '../../ui/Router/Router';
import { Icon24StickerSmileOutline } from '@vkontakte/icons';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
export const AttachStickerPack = ({ attach, isInBubble, isOut }) => {
    const { url, title, subtitle, packId, iconUrl } = attach;
    const { navigate } = useRouter();
    const handleStickerPackPreview = () => {
        navigate({
            kind: 'StickerPackProxyRoute',
            stickerPackId: packId,
            externalUrl: url,
        });
    };
    return (React.createElement(AttachmentCell, { title: title, subtitle: subtitle, image: iconUrl || React.createElement(Icon24StickerSmileOutline, null), alt: title, isInBubble: isInBubble, isOut: isOut, onClick: handleStickerPackPreview }));
};
//# sourceMappingURL=AttachStickerPack.js.map