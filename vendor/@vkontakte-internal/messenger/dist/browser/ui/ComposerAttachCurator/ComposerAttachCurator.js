import { Icon20MusicOutline, Icon24MusicOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import React from 'react';
export const ComposerAttachCurator = ({ attach, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20MusicOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24MusicOutline, null) })), main: lang.use('me_attaches_curator'), secondary: attach.title }));
};
//# sourceMappingURL=ComposerAttachCurator.js.map