import '../../ui/PostComment/PostComment.css';
import React, { forwardRef } from 'react';
import * as Peer from '../../../core/model/Peer';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import cx from 'classnames';
import { PostCommentNormal } from '../../ui/PostComment/PostCommentNormal';
import { PostCommentDeleted, PostCommentMarkedDeleted, } from '../../ui/PostComment/PostCommentDeleted';
import { Avatar } from '../../ui/Avatar/Avatar';
import { useBrowserEnv, usePrevious } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { UserLikesMenuDropdown } from '../../ui/UserLikesMenu/UserLikesMenu';
import { AnimatedCounter } from '../../ui/AnimatedCounter/AnimatedCounter';
import { Icon16Like, Icon16LikeOutline } from '@vkontakte/icons';
import { Link } from '../../ui/Link/Link';
import { withHighlight } from '../../ui/HighlightHOC/withHighlight';
export const COMMENT_AVATAR_SIZES = {
    default: 28,
    compact: 24,
};
export const PostComment = ({ className, comment, isCompact, clampTextLines, getIsActionAvailable, onAction, onLoadMoreLikePeers, onLikeModalOpen, onReplyLabelClick, hideFirstReplyLabel, ...props }) => {
    switch (comment.kind) {
        case 'Normal': {
            return (React.createElement(PostCommentNormal, { className: className, comment: comment, isCompact: isCompact, clampTextLines: clampTextLines, getIsActionAvailable: getIsActionAvailable, onAction: onAction, onLoadMoreLikePeers: onLoadMoreLikePeers, onLikeModalOpen: onLikeModalOpen, onReplyLabelClick: onReplyLabelClick, hideFirstReplyLabel: hideFirstReplyLabel, ...props }));
        }
        case 'MarkedDeleted': {
            return (React.createElement(PostCommentMarkedDeleted, { comment: comment, className: className, isCompact: isCompact, getIsActionAvailable: getIsActionAvailable, onAction: onAction, ...props }));
        }
        case 'Deleted': {
            return (React.createElement(PostCommentDeleted, { className: className, isCompact: isCompact, getIsActionAvailable: getIsActionAvailable, onAction: onAction, ...props }));
        }
        default:
            exhaustivenessCheck(comment);
    }
};
export const PostCommentLayout = forwardRef(({ children, contentClassName, avatar, className, ...props }, ref) => {
    return (React.createElement("div", { ...props, ref: ref, className: cx('PostComment', className) },
        React.createElement("div", { className: "PostComment__avatar" }, avatar),
        React.createElement("div", { className: cx('PostComment__content', contentClassName) }, children)));
});
export const PostCommentAvatar = ({ peer, className, isCompact, }) => {
    return (React.createElement(Link, { to: {
            kind: 'PeerPanel',
            peerId: peer.id,
            screenName: Peer.screenName(peer),
        }, className: className, "aria-hidden": true, tabIndex: -1 },
        React.createElement(Avatar, { size: isCompact
                ? COMMENT_AVATAR_SIZES.compact
                : COMMENT_AVATAR_SIZES.default, peer: peer })));
};
export const PostCommentLikePanel = forwardRef(({ isLiked, likesCount, likedPeerIds, onClick, onMenuClick, showMenuDropdown = false, }, $ref) => {
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const prevIsLiked = usePrevious(isLiked);
    const hasLikes = likesCount !== 0;
    const isButtonHidden = !isLiked && !hasLikes;
    const isAnimating = isLiked && !prevIsLiked && prevIsLiked !== undefined;
    const renderPanel = () => (React.createElement("div", { ref: $ref, className: cx('PostComment__likePanel', {
            'PostComment__likePanel--active': isLiked,
            'PostComment__likePanel--animate': isAnimating,
        }), onClick: onClick },
        React.createElement("button", { "aria-label": lang.use(isLiked
                ? 'me_comment_action_like_remove'
                : 'me_comment_action_like_set'), className: cx('PostComment__button', {
                'PostComment__button--hidden': isButtonHidden,
            }) }, isLiked ? React.createElement(Icon16Like, null) : React.createElement(Icon16LikeOutline, null)),
        hasLikes && (React.createElement(AnimatedCounter, { className: "PostComment__likePanelCounter", count: likesCount }))));
    // Свойство и условие можно будет удалить, когда доделаем меню лайков
    if (!showMenuDropdown) {
        return renderPanel();
    }
    return (React.createElement(UserLikesMenuDropdown, { isLiked: isLiked, onMenuClick: onMenuClick, peerIds: isMobileLayout ? [] : likedPeerIds, totalCount: likesCount }, renderPanel()));
});
export const PostCommnentWithHighlight = withHighlight(PostComment);
//# sourceMappingURL=PostComment.js.map