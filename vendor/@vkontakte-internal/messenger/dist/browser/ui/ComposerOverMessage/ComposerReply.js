import React from 'react';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, usePeers } from '../../hooks/misc';
import { ComposerOverMessage } from './ComposerOverMessage';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { PostCommentPreview } from '../../ui/PostCommentPreview/PostCommentPreview';
export const ComposerReply = React.memo(({ className, reply, onRemoveReply, scrollToMessage, isCompactView }) => {
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    // Получаем пользователей не через Peer.safeGet, так как они могут быть не
    // загружены на момент рендера.
    // Но они точно будут загружены в экшене: ActualizeComposerDraft .
    const author = peers.get(reply.authorId);
    const title = author !== undefined
        ? Peer.name(author)
        : lang.use('me_chat_members_count', {
            num: 1,
        });
    const handleClick = () => {
        const { cmid, peerId } = reply;
        const isUnavailable = 'isUnavailable' in reply ? reply.isUnavailable : false;
        if (!peerId || !scrollToMessage) {
            return;
        }
        scrollToMessage({ peerId, cmid, isUnavailable });
    };
    return (React.createElement(ComposerOverMessage, { className: className, title: title, isCompactView: isCompactView, content: React.createElement(MessagePreview, { message: reply }), onRemove: onRemoveReply, onClick: handleClick, highlighted: true }));
});
export const ComposerCommentReply = ({ reply, isCompactView, className, onRemoveReply }) => {
    const peers = usePeers();
    const author = Peer.safeGet(peers, reply.peerId);
    return (React.createElement(ComposerOverMessage, { className: className, isCompactView: isCompactView, title: Peer.name(author), content: React.createElement(PostCommentPreview, { comment: reply }), onRemove: onRemoveReply, highlighted: true }));
};
//# sourceMappingURL=ComposerReply.js.map