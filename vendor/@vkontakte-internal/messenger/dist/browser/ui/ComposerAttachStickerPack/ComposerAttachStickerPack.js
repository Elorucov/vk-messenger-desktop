import { Icon20StickerSmileOutline, Icon24StickerSmileOutline, } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import React from 'react';
export const ComposerAttachStickerPack = ({ attach, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20StickerSmileOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24StickerSmileOutline, null) })), main: lang.use('me_attaches_sticker_pack'), secondary: attach.title }));
};
//# sourceMappingURL=ComposerAttachStickerPack.js.map