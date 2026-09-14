import React from 'react';
import { ComposerAttachCard, ComposerFileAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import { Icon20MusicOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
export const ComposerAttachArtist = ({ artist, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20MusicOutline, null)) : (React.createElement(ComposerFileAttachCardIcon, { ext: "audio" })), main: artist.name, secondary: lang.use('me_attach_artist_description') }));
};
//# sourceMappingURL=ComposerAttachArtist.js.map