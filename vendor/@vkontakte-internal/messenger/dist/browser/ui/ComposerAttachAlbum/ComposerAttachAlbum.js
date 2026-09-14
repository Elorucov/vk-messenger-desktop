import React from 'react';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon24PhotosStackOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const ComposerAttachAlbum = ({ album, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon24PhotosStackOutline, { width: 20 })) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24PhotosStackOutline, null) })), main: album.title, secondary: lang.use('me_attaches_album_photos', {
            num: album.size,
        }) }));
};
//# sourceMappingURL=ComposerAttachAlbum.js.map