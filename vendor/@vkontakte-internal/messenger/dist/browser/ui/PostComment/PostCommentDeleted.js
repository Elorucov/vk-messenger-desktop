import React from 'react';
import '../../ui/PostComment/PostCommentDeleted.css';
import { PostCommentLayout } from '../../ui/PostComment/PostComment';
import { useBrowserEnv } from '../../hooks/misc';
import { Icon150AvatarPlaceholderAnonim } from '@vkontakte-internal/icons-private';
import { Button, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
export const PostCommentDeleted = ({ className, isCompact, getIsActionAvailable, onAction, ...props }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(PostCommentLayout, { className: className, avatar: React.createElement(Icon150AvatarPlaceholderAnonim, { width: 28, height: 28 }), ...props },
        React.createElement("span", { className: "PostCommentDeleted__text" }, lang.use('me_comment_was_deleted')),
        getIsActionAvailable('deleteThread') && (React.createElement(PostCommentDeletedActionButton, { appearance: "negative", title: lang.use('me_comments_action_delete_tree'), onClick: () => onAction?.('deleteThread') })),
        getIsActionAvailable('restoreThread') && (React.createElement(PostCommentDeletedActionButton, { appearance: "accent", title: lang.use('me_comments_action_restore_tree'), onClick: () => onAction?.('restoreThread') }))));
};
export const PostCommentMarkedDeleted = ({ comment, className, isCompact, getIsActionAvailable, onAction, ...props }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(PostCommentLayout, { className: className, avatar: React.createElement(Icon150AvatarPlaceholderAnonim, { width: 28, height: 28 }), ...props },
        React.createElement("span", { className: "PostCommentDeleted__text" }, comment.isThreadDeleted
            ? lang.use('me_comment_tree_was_deleted')
            : lang.use('me_comment_was_deleted')),
        React.createElement(ButtonGroup, null,
            getIsActionAvailable('restore') && (React.createElement(PostCommentDeletedActionButton, { appearance: "accent", title: lang.use('me_comment_action_restore'), onClick: () => onAction?.('restore') })),
            getIsActionAvailable('report') && (React.createElement(PostCommentDeletedActionButton, { appearance: "negative", title: lang.use('me_comment_action_report'), onClick: () => onAction?.('report') })),
            getIsActionAvailable('ban') && (React.createElement(PostCommentDeletedActionButton, { appearance: "negative", title: lang.use('me_comment_action_ban'), onClick: () => onAction?.('ban') }))),
        getIsActionAvailable('unban') && (React.createElement("div", { className: "PostCommentDeleted__buttonRow" },
            React.createElement("span", { className: "PostCommentDeleted__text" }, lang.use('me_channels_user_banned')),
            React.createElement(PostCommentDeletedActionButton, { appearance: "accent", title: lang.use('me_comment_action_unban'), onClick: () => onAction?.('unban') }))),
        getIsActionAvailable('restoreThread') && (React.createElement(PostCommentDeletedActionButton, { className: "PostCommentDeleted__thread--marginTop", appearance: "accent", title: lang.use('me_comments_action_restore_tree'), onClick: () => onAction?.('restoreThread') })),
        getIsActionAvailable('deleteThread') && (React.createElement(PostCommentDeletedActionButton, { className: "PostCommentDeleted__thread--marginTop", appearance: "negative", title: lang.use('me_comments_action_delete_tree'), onClick: () => onAction?.('deleteThread') }))));
};
export const PostCommentDeletedActionButton = ({ title, className, onClick, ...attributes }) => {
    return (React.createElement(Button, { align: "left", className: className, mode: "link", ...attributes, onClick: onClick }, title));
};
//# sourceMappingURL=PostCommentDeleted.js.map