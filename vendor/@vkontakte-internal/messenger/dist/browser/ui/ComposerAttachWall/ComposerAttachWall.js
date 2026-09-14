import { Icon20ArticleBoxOutline, Icon24ArticleBoxOutline, } from '@vkontakte/icons';
import { useBrowserEnv, usePeer } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import * as Peer from '../../../core/model/Peer';
import React from 'react';
export const ComposerAttachWall = ({ wall, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    const channel = usePeer(wall.authorId, false);
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20ArticleBoxOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24ArticleBoxOutline, null) })), main: lang.use('me_attaches_wall'), secondary: channel ? Peer.name(channel) : '' }));
};
//# sourceMappingURL=ComposerAttachWall.js.map