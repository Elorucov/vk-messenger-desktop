import { Icon20CommentOutline, Icon24CommentOutline } from '@vkontakte/icons';
import { useBrowserEnv, usePeer } from '../../hooks/misc';
import { ComposerAttachCard, ComposerAttachCardIcon, } from '../../ui/ComposerAttachCard/ComposerAttachCard';
import * as Peer from '../../../core/model/Peer';
import React from 'react';
export const ComposerAttachWallReply = ({ wallReply, isCompactView, }) => {
    const { lang } = useBrowserEnv();
    const channel = usePeer(wallReply.ownerId, false);
    return (React.createElement(ComposerAttachCard, { icon: isCompactView ? (React.createElement(Icon20CommentOutline, null)) : (React.createElement(ComposerAttachCardIcon, { icon: React.createElement(Icon24CommentOutline, null) })), main: lang.use('me_attaches_wall_reply'), secondary: channel ? Peer.name(channel) : '' }));
};
//# sourceMappingURL=ComposerAttachWallReply.js.map