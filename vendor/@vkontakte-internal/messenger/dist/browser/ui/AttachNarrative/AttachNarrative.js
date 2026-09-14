import { useBrowserEnv, usePeers } from '../../hooks/misc';
import '../../ui/AttachNarrative/AttachNarrative.css';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import React, { useMemo } from 'react';
import { Icon24LockOutline } from '@vkontakte/icons';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { Link } from '../../ui/Link/Link';
import { getExpectedAttachPhotoWidth } from '../../ui/AttachCard/AttachCard';
export const AttachNarrative = ({ narrative, isInBubble, isOut, }) => {
    const { title, ownerId, canSee } = narrative;
    const peers = usePeers();
    const { lang } = useBrowserEnv();
    const picture = Attach.preview(narrative, getExpectedAttachPhotoWidth(), 0);
    const narrativeOwnerName = useMemo(() => {
        const narrativeOwner = peers.get(ownerId);
        return narrativeOwner ? Peer.name(narrativeOwner) : undefined;
    }, [ownerId, peers]);
    /** Невозможное событие, так как участвующий в сообщении пир будет загружен в messages.getHistory */
    if (!narrativeOwnerName) {
        return null;
    }
    return (React.createElement(Link, { to: {
            kind: 'AttachProxyRoute',
            attach: narrative,
        }, className: "AttachNarrative", disabled: !canSee }, canSee ? (React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, title: title, subtitle: [
            lang.use('me_attaches_narratives', { num: 1 }),
            narrativeOwnerName,
        ], imageShape: "roundWithBorder", image: picture?.url })) : (React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, isAvailable: false, title: lang.use('me_attach_private_narrative'), icon: React.createElement(Icon24LockOutline, null), imageShape: "round" }))));
};
//# sourceMappingURL=AttachNarrative.js.map