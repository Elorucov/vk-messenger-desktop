import '../../ui/ChannelPostSecondary/ChannelPostSecondary.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from '../../ui/Router/Router';
import * as Comment from '../../../core/model/Comment';
import * as Post from '../../../core/model/Post';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useFeatureFlags, usePeer, usePrevious, } from '../../hooks/misc';
import { Button, Caption, Footnote } from '@vkontakte/vkui';
import { ChannelPostAuthor } from '../../ui/ChannelPostAuthor/ChannelPostAuthor';
import { ChannelAvatar } from '../../ui/ChannelAvatar/ChannelAvatar';
import { ChannelPostWrapper } from '../../ui/ChannelPostWrapper/ChannelPostWrapper';
import { ChannelPostDonutPlaceholder } from '../../ui/ChannelPostDonutPlaceholder/ChannelPostDonutPlaceholder';
import { ChannelPostMediaAttaches } from '../../ui/ChannelPostMediaAttaches/ChannelPostMediaAttaches';
import { ChannelPostContentWrapper } from '../../ui/ChannelPostContentWrapper/ChannelPostContentWrapper';
import { PostText } from '../../ui/PostText/PostText';
import { ChannelPostAttaches } from '../../ui/ChannelPostAttaches/ChannelPostAttaches';
import { ReactionChip } from '../../ui/ReactionChip/ReactionChip';
import * as Attach from '../../../core/model/Attach';
import { usePostReactionAnimation } from '../../hooks/useMessageReactionAnimation';
import { ChannelPostMeta } from '../../ui/ChannelPost/ChannelPost';
import { Icon16Advertising, Icon16Comment, Icon24CommentSlashOutline, Icon56BlockOutline, Icon16CommentOutline, Icon12StarCircleFillYellow, } from '@vkontakte/icons';
import cx from 'classnames';
import { HIGHLIGHTER_STYLES_ACCENT } from '../../ui/Highlighter/Highlighter';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { ChannelPostSecondaryHighlightWrapper } from '../../ui/ChannelPostHighlightWrapper/ChannelPostSecondaryHighlightWrapper';
import { ChannelLabel } from '../../ui/ChannelLabel/ChannelLabel';
import { ChannelModerationModals } from '../../ui/ChannelModerationModals/ChannelModerationModals';
export const ChannelPostSecondary = React.memo(({ channelId, post, channelPhoto, channelName, signerId, isChannelArchived, postReactions, isRepostsDisabled, isFocused, isHighlighted, searchQueryToHighlight, onForward, className, canEdit, canDelete, openedFromComments, canChangeCommentsPosting, isCommunityChannel, onSizeChange, onSend, onEditSendTime, }) => {
    const dispatch = useDispatch();
    const featureFlags = useFeatureFlags();
    const { screenRoute, rightPanel, replace, navigate } = useRouter();
    const { isMobileLayout } = useLayoutData();
    const [isFakeNewsModerationModalShown, setIsFakeNewsModerationModal] = useState(false);
    const peer = usePeer(signerId);
    const signerName = peer ? Peer.name(peer) : undefined;
    const getAdditionalLinkPayload = useCallback((params) => {
        return post.kind === 'Postponed'
            ? { kind: 'postponedPost', channelId, cmid: post.cmid }
            : {
                kind: 'post',
                channelId,
                cmid: post.cmid,
                // Для фото аттачей необходим параметр mediaViewerItemPosition для поддержки сквозного просмотра
                ...(params &&
                    'mediaViewerItemPosition' in params && {
                    mediaViewerItemPosition: params.mediaViewerItemPosition,
                }),
            };
    }, [channelId, post.cmid, post.kind]);
    const [useCSSMinContentWidth, setUseCSSMinContentWidth] = useState(false);
    const [attachWidth, setAttachWidth] = useState(undefined);
    const handleAttachesWidthChange = useCallback((width) => {
        onSizeChange?.();
        if (featureFlags.vkm_new_bubbles_width_calc) {
            setUseCSSMinContentWidth(true);
            return;
        }
        setAttachWidth((prev) => {
            const attachWidth = Math.max(width || 0, prev || 0);
            if (attachWidth) {
                return attachWidth;
            }
            return undefined;
        });
    }, [featureFlags.vkm_new_bubbles_width_calc, onSizeChange]);
    const handleLinkClick = (e) => {
        const nextRoute = {
            organiser: screenRoute.organiser,
            ...rightPanel,
            kind: 'ChannelPanel',
            channelId: channelId,
            section: undefined,
        };
        if (rightPanel?.kind === 'ChannelPanel' &&
            channelId === rightPanel.channelId) {
            e.preventDefault();
            if (rightPanel.section !== undefined) {
                replace(nextRoute);
            }
            return;
        }
        navigate(nextRoute);
    };
    const handleReactionClick = (reactionId) => {
        if (post.kind === 'Postponed') {
            return;
        }
        if (post.reactionId === reactionId) {
            dispatch({
                type: 'UserUnsetChannelReaction',
                channelId: channelId,
                cmid: post.cmid,
            });
        }
        else {
            dispatch({
                type: 'UserSetChannelReaction',
                channelId: channelId,
                cmid: post.cmid,
                reactionId: reactionId,
            });
        }
    };
    const handleCommentsClick = () => {
        if (screenRoute.kind !== 'ChannelRoute') {
            return;
        }
        navigate({
            ...screenRoute,
            kind: 'ChannelRoute',
            channelId,
            postCmid: post.cmid,
            commentCmid: Comment.resolveCmid(),
        });
    };
    const attaches = post.attaches;
    const postHasDonutPlaceholder = Post.isDonutPlaceholder(post);
    const isPrimaryAttaches = post.chunks.length === 0;
    const hasMediaAttaches = Boolean(attaches.photos ||
        attaches.videos ||
        (featureFlags.vkm_channel_stub_attach &&
            (attaches.channelStubPhoto ||
                attaches.channelStubVideo ||
                Attach.channelStubDocsWithPreview(attaches.channelStubDoc))) ||
        Attach.docsWithPreview(attaches.docs));
    const hasPublicVideo = !isMobileLayout &&
        Attach.hasPublicVideo(attaches) &&
        attaches.videos?.[0].ownerId !== channelId;
    if (post.kind === 'Normal' && post.isDeleted) {
        return (React.createElement(ChannelPostWrapper, { canDelete: canDelete, canEdit: canEdit, className: className, isRepostsDisabled: isRepostsDisabled, postHasDonutPlaceholder: postHasDonutPlaceholder, onForward: onForward, channelId: channelId, isChannelArchived: isChannelArchived, post: post, onSend: onSend, onEditSendTime: onEditSendTime, postReactions: postReactions, canPostComments: post.comments.canPost, canChangeCommentsPosting: canChangeCommentsPosting, onReactionClick: handleReactionClick, isCommunityChannel: isCommunityChannel },
            React.createElement(ChannelPostSecondaryHighlightWrapper, { isActive: isHighlighted },
                React.createElement(ChannelPostSecondaryDeleted, { reason: post.deleteInfo?.reason, details: post.deleteInfo?.details }))));
    }
    return (React.createElement(ChannelPostWrapper, { canDelete: canDelete, canEdit: canEdit, className: className, isRepostsDisabled: isRepostsDisabled, postHasDonutPlaceholder: postHasDonutPlaceholder, onForward: onForward, channelId: channelId, isChannelArchived: isChannelArchived, isCommunityChannel: isCommunityChannel, post: post, onSend: onSend, onEditSendTime: onEditSendTime, postReactions: postReactions, canPostComments: post.comments.canPost, canChangeCommentsPosting: canChangeCommentsPosting, onReactionClick: handleReactionClick },
        React.createElement(ChannelPostSecondaryHighlightWrapper, { isActive: isHighlighted },
            React.createElement("div", { className: cx('ChannelPostSecondary', {
                    'ChannelPostSecondary--withText': post.chunks.length !== 0,
                }) },
                React.createElement("div", { className: "ChannelPostAvatar", tabIndex: 0, role: "button", "aria-label": channelName, onClick: handleLinkClick },
                    React.createElement(ChannelAvatar, { name: channelName, photo: channelPhoto, size: 36 })),
                React.createElement(ChannelPostHeader, { onFakeNewsLabelClick: () => setIsFakeNewsModerationModal(true), onTitleClick: handleLinkClick, channelName: channelName, signerName: signerName, sentAt: post.sentAt, fakeNews: post.kind === 'Normal' ? post.fakeNews : false, updatedAt: post.kind === 'Normal' ? post.updatedAt : undefined, views: post.kind === 'Normal' ? post.views : undefined, isDonut: post.donut?.isDonut, postHasDonutPlaceholder: postHasDonutPlaceholder, markedAsAds: post.ads.markedAsAds, commentsCount: post.kind === 'Normal' ? post.comments.count : undefined, onCommentsClick: !openedFromComments && post.comments.canView
                        ? handleCommentsClick
                        : undefined, isPostponedPostWithDisabledComments: post.kind === 'Postponed' && !post.comments.canClose }),
                React.createElement(ChannelPostContentWrapper, { className: cx('ChannelPostSecondary__content', {
                        'ChannelPostSecondary--fitMediaAttachesWidth': useCSSMinContentWidth,
                    }) },
                    postHasDonutPlaceholder && (React.createElement(ChannelPostDonutPlaceholder, { paywall: post.donut?.paywall, placeholder: post.donut?.placeholder })),
                    hasMediaAttaches && !hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { className: cx('ChannelPostSecondary__mediaAttaches', {
                            'ChannelPostSecondary__mediaAttaches--withPublicVideo': hasPublicVideo,
                        }), attaches: attaches, hidePublicVideoInfo: true, getMediaAttachLinkPayload: getAdditionalLinkPayload, onWidthChange: handleAttachesWidthChange })),
                    React.createElement("div", { className: cx({
                            ChannelPostSecondary__mainContent: !useCSSMinContentWidth,
                        }), style: attaches.photos || attaches.videos || attaches.wall
                            ? { width: attachWidth }
                            : undefined },
                        post.chunks && (React.createElement(PostText, { channelId: channelId, chunks: post.chunks, isFocused: isFocused, isCommunityChannel: isCommunityChannel, searchQueryToHighlight: searchQueryToHighlight, ...HIGHLIGHTER_STYLES_ACCENT })),
                        hasMediaAttaches && hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { className: cx('ChannelPostSecondary__mediaAttaches', {
                                'ChannelPostSecondary__mediaAttaches--withPublicVideo': hasPublicVideo,
                            }), attaches: attaches, getMediaAttachLinkPayload: getAdditionalLinkPayload, onWidthChange: handleAttachesWidthChange })),
                        React.createElement(ChannelPostAttaches, { className: "ChannelPostSecondary__attaches", attaches: attaches, channelId: channelId, postCmid: post.cmid, updatedAt: post.kind === 'Normal' ? post.updatedAt : undefined, isPrimary: isPrimaryAttaches, onWidthChange: handleAttachesWidthChange, getMediaAttachLinkPayload: getAdditionalLinkPayload, withSearchHighlight: isFocused, searchQueryToHighlight: searchQueryToHighlight, ...HIGHLIGHTER_STYLES_ACCENT }),
                        React.createElement("div", { className: "ChannelPostSecondary__footer" }, post.kind === 'Normal' && (React.createElement(ChannelReactions, { post: post, channelId: channelId, postReactions: postReactions }))),
                        featureFlags.vkm_nonbubble_comment_btn && (React.createElement(ChannelsComment, { commentsCount: post.kind === 'Normal' ? post.comments.count : undefined, onCommentsClick: !openedFromComments && post.comments.canView
                                ? handleCommentsClick
                                : undefined, isPostponedPostWithDisabledComments: post.kind === 'Postponed' && !post.comments.canView })))))),
        isFakeNewsModerationModalShown && (React.createElement(ChannelModerationModals, { activeModal: "FalsePostInformationModal" /* CHANNEL_MAIN_MODALS.FALSE_POST_INFORMATION_MODAL */, channelId: channelId, onClose: () => setIsFakeNewsModerationModal(false) }))));
});
export const ChannelPostHeader = ({ channelName, onTitleClick, signerName, sentAt, views, updatedAt, commentsCount, onCommentsClick, onFakeNewsLabelClick, isDonut, postHasDonutPlaceholder, markedAsAds, fakeNews, isPostponedPostWithDisabledComments, }) => {
    const { lang } = useBrowserEnv();
    const featureFlags = useFeatureFlags();
    return (React.createElement("div", { className: "ChannelPostHeader" },
        React.createElement(Footnote, { weight: "1", className: "ChannelPostHeader__titleWrapper", onClick: onTitleClick, role: "button", "aria-label": channelName, useAccentWeight: true },
            React.createElement("div", { className: "ChannelPostHeader__title" }, channelName)),
        (signerName || isDonut || markedAsAds || fakeNews) && (React.createElement("div", { className: "ChannelPostHeader__marks" },
            markedAsAds && (React.createElement(ChannelLabel, { withBackdrop: true, labelIcon: React.createElement(Icon16Advertising, { width: 12, height: 12 }), text: lang.use('me_channel_ad_mark') })),
            signerName && React.createElement(ChannelPostAuthor, { name: signerName }),
            isDonut && !postHasDonutPlaceholder && (React.createElement(ChannelLabel, { withBackdrop: true, labelIcon: React.createElement(Icon12StarCircleFillYellow, null), text: lang.use('me_channel_donut_mark') })),
            fakeNews && (React.createElement(ChannelLabel, { withBackdrop: true, text: lang.use('me_channel_post_content_false_information_button_text'), onClick: onFakeNewsLabelClick })))),
        React.createElement("div", { className: "ChannelPostSecondary__meta" },
            React.createElement("div", { className: "ChannelPostSecondary__metaWrapper" },
                !featureFlags.vkm_nonbubble_comment_btn &&
                    isPostponedPostWithDisabledComments && (React.createElement("div", { className: "ChannelPostSecondary__comments ChannelPostSecondary__comments--disabled" },
                    React.createElement(Icon24CommentSlashOutline, null),
                    React.createElement(Caption, { level: "2", className: "ChannelPostSecondary__commentsText" }, lang.use('me_channel_postponed_post_comments_disabled')))),
                !featureFlags.vkm_nonbubble_comment_btn &&
                    onCommentsClick &&
                    commentsCount !== undefined && (React.createElement("div", { className: cx('ChannelPostSecondary__comments'), tabIndex: 0, role: "button", "aria-label": lang.use('me_post_comments_count', {
                        num: commentsCount,
                        formatted: 'short',
                    }), onClick: onCommentsClick },
                    React.createElement(Icon16Comment, null),
                    Boolean(commentsCount) && (React.createElement(Caption, { className: "ChannelPostSecondary__commentsCount", level: "2" }, commentsCount)),
                    React.createElement(Caption, { level: "2", className: "ChannelPostSecondary__commentsText" }, commentsCount
                        ? lang.use('me_post_comments_count', {
                            num: commentsCount,
                            formatted: 'short',
                        })
                        : lang.use('me_channel_post_comment')))),
                React.createElement(ChannelPostMeta, { sentAt: sentAt, views: views, updatedAt: updatedAt })))));
};
export const ChannelReactions = ({ postReactions, post, channelId }) => {
    const prevCurrentReactionId = usePrevious(post.reactionId);
    const { animate, hasAnimation, onAnimationEnd } = usePostReactionAnimation();
    const dispatch = useDispatch();
    const handleAnimationEnd = useCallback((reactionId) => {
        onAnimationEnd(post.cmid, reactionId);
    }, [post, onAnimationEnd]);
    useEffect(() => {
        if (typeof post.reactionId !== 'undefined' &&
            post.reactionId !== prevCurrentReactionId) {
            animate(post.cmid, post.reactionId, true);
        }
    }, [post.reactionId, animate, post.cmid, prevCurrentReactionId]);
    const hasReactions = post.reactions.size > 0;
    if (!hasReactions || !postReactions) {
        return null;
    }
    // фильтруем недоступные реакции
    const reactionsArray = [...post.reactions.values()].filter((reaction) => postReactions.has(reaction.reactionId));
    const handleReactionClick = (reactionId) => {
        if (reactionId === null) {
            // клик на неизвестную реакцию, в каналах не возможно
            return;
        }
        if (post.reactionId === reactionId) {
            dispatch({
                type: 'UserUnsetChannelReaction',
                channelId: channelId,
                cmid: post.cmid,
            });
        }
        else {
            dispatch({
                type: 'UserSetChannelReaction',
                channelId: channelId,
                cmid: post.cmid,
                reactionId: reactionId,
            });
        }
    };
    return (React.createElement(React.Fragment, null, reactionsArray.map((reaction) => {
        const react = postReactions.get(reaction.reactionId) || null;
        return (React.createElement(ReactionChip, { key: reaction.reactionId, reaction: react, count: reaction.count, theme: "incoming", active: reaction.reactionId === post.reactionId, forceNumber: true, disableAnimations: false, playAnimation: hasAnimation(post.cmid, reaction.reactionId), onClick: handleReactionClick, onAnimationEnd: handleAnimationEnd }));
    })));
};
const ChannelPostSecondaryDeleted = ({ reason, details, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "ChannelPostPrimary" },
        React.createElement(ChannelPostContentWrapper, { className: "ChannelPostPrimary__content" },
            React.createElement("div", { className: "ChannelPostSecondaryDeleted" },
                React.createElement("div", { className: "ChannelPostSecondaryDeleted__icon" },
                    React.createElement(Icon56BlockOutline, null)),
                React.createElement("div", { className: "ChannelPostSecondaryDeleted__title" }, reason ?? lang.use('me_channel_post_deleted')),
                details && (React.createElement("div", { className: "ChannelPostSecondaryDeleted__desc" }, details))))));
};
const ChannelsComment = ({ commentsCount, onCommentsClick, isPostponedPostWithDisabledComments, }) => {
    const { lang } = useBrowserEnv();
    if (isPostponedPostWithDisabledComments) {
        return (React.createElement(Button, { size: "l", mode: "link", appearance: "accent", before: React.createElement(Icon24CommentSlashOutline, { width: 16, height: 16 }), disabled: true }, lang.use('me_channel_postponed_post_comments_disabled')));
    }
    return (onCommentsClick &&
        commentsCount !== undefined && (React.createElement(Button, { size: "l", onClick: onCommentsClick, mode: "link", appearance: "accent", before: React.createElement(Icon16CommentOutline, null) }, commentsCount === 0
        ? lang.use('me_channel_post_comment')
        : lang.use('me_post_comments_count', {
            num: commentsCount,
            formatted: 'short',
        }))));
};
//# sourceMappingURL=ChannelPostSecondary.js.map