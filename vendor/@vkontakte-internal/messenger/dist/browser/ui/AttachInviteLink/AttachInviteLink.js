import '../../ui/AttachInviteLink/AttachInviteLink.css';
import React, { useMemo } from 'react';
import * as Attach from '../../../core/model/Attach';
import { AttachmentCell } from '../../ui/AttachmentCell/AttachmentCell';
import { useRouter } from '../../ui/Router/Router';
import { getExpectedAttachPhotoWidth } from '../../ui/AttachCard/AttachCard';
import { ExternalLink } from '../../ui/Link/Link';
import { getChatJoinHash } from '../../../core/utils/links';
import { useBrowserEnv, useFeatureFlags } from '../../hooks/misc';
export const AttachInviteLink = ({ link: attach, isInBubble, isOut, }) => {
    const { isEduAvailable } = useBrowserEnv();
    const { screenRoute, rightPanel, navigate } = useRouter();
    const { title, subtitle, url } = attach;
    const { vkm_router_modal_unification } = useFeatureFlags();
    const picture = Attach.preview(attach, getExpectedAttachPhotoWidth(), 0, true);
    const inviteRoute = useMemo(() => {
        const peerId = (screenRoute.kind === 'ConvoRoute' && screenRoute.peerId) ||
            (rightPanel?.kind === 'PeerPanel' && rightPanel.peerId);
        if (!peerId) {
            return null;
        }
        const hash = getChatJoinHash(url, isEduAvailable);
        if (!hash) {
            return null;
        }
        if (vkm_router_modal_unification) {
            return { kind: 'ChatInviteModal', hash, entrypoint: 'convo_invite' };
        }
        return {
            kind: 'ConvoRoute',
            entrypoint: 'convo_invite',
            peerId,
            chatJoinHash: hash,
        };
    }, [
        url,
        isEduAvailable,
        screenRoute,
        rightPanel,
        vkm_router_modal_unification,
    ]);
    // Невозможное состояние, в InviteLink поле photo всегда есть
    if (!picture) {
        return null;
    }
    return (React.createElement(ExternalLink, { className: "AttachInviteLink", href: attach.url, onClick: inviteRoute
            ? (e) => {
                e.preventDefault();
                navigate(inviteRoute);
            }
            : undefined },
        React.createElement(AttachmentCell, { isInBubble: isInBubble, isOut: isOut, title: title, subtitle: subtitle, image: picture.url })));
};
//# sourceMappingURL=AttachInviteLink.js.map