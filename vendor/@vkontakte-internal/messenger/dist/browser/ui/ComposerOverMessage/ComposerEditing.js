import React from 'react';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerOverMessage } from './ComposerOverMessage';
import { MessagePreview } from '../../ui/MessagePreview/MessagePreview';
import { ChannelPostPreview } from '../../ui/ChannelPostPreview/ChannelPostPreview';
import { PostCommentPreview } from '../../ui/PostCommentPreview/PostCommentPreview';
export const ComposerEditingMessage = ({ className, message, isCompactView, onCancelEditing }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerOverMessage, { className: className, isCompactView: isCompactView, title: lang.use('me_composer_editing_title'), content: React.createElement(MessagePreview, { message: message }), onRemove: onCancelEditing, highlighted: true }));
};
export const ComposerEditingPost = ({ className, post, isCompactView, onCancelEditing }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerOverMessage, { className: className, isCompactView: isCompactView, title: lang.use('me_composer_editing_title'), content: React.createElement(ChannelPostPreview, { post: post }), onRemove: onCancelEditing, highlighted: true }));
};
export const ComposerEditingComment = ({ className, comment, isCompactView, onCancelEditing }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(ComposerOverMessage, { className: className, isCompactView: isCompactView, title: lang.use('me_comments_composer_editing_title'), content: React.createElement(PostCommentPreview, { comment: comment }), onRemove: onCancelEditing, highlighted: true }));
};
//# sourceMappingURL=ComposerEditing.js.map