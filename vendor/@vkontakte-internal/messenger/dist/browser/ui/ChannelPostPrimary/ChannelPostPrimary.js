import '../../ui/ChannelPostPrimary/ChannelPostPrimary.css';
import React, { useCallback, useState } from 'react';
import { useRouter } from '../../ui/Router/Router';
import * as Comment from '../../../core/model/Comment';
import * as Post from '../../../core/model/Post';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useDispatch, useFeatureFlags, usePeer, } from '../../hooks/misc';
import { Separator, Subhead } from '@vkontakte/vkui';
import { ChannelPostAuthor } from '../../ui/ChannelPostAuthor/ChannelPostAuthor';
import { ChannelPostWrapper } from '../../ui/ChannelPostWrapper/ChannelPostWrapper';
import { ChannelPostDonutPlaceholder } from '../../ui/ChannelPostDonutPlaceholder/ChannelPostDonutPlaceholder';
import { ChannelPostMediaAttaches } from '../../ui/ChannelPostMediaAttaches/ChannelPostMediaAttaches';
import { ChannelPostContentWrapper } from '../../ui/ChannelPostContentWrapper/ChannelPostContentWrapper';
import { PostText } from '../../ui/PostText/PostText';
import { ChannelPostAttaches } from '../../ui/ChannelPostAttaches/ChannelPostAttaches';
import { ChannelPostMeta } from '../../ui/ChannelPost/ChannelPost';
import { Icon16Advertising, Icon16Chevron, Icon16InfoOutline, Icon24CommentSlashOutline, Icon16CommentOutline, Icon56BlockOutline, Icon12StarCircleFillYellow, } from '@vkontakte/icons';
import { ChannelReactions } from '../../ui/ChannelPostSecondary/ChannelPostSecondary';
import cx from 'classnames';
import { HIGHLIGHTER_STYLES_ACCENT } from '../../ui/Highlighter/Highlighter';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { ChannelPostPrimaryHighlightWrapper } from '../../ui/ChannelPostHighlightWrapper/ChannelPostPrimaryHighlightWrapper';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { ChannelLabel } from '../../ui/ChannelLabel/ChannelLabel';
import { ChannelModerationModals } from '../../ui/ChannelModerationModals/ChannelModerationModals';
export const ChannelPostPrimary = React.memo(({ channelId, post, signerId, isChannelArchived, isCommunityChannel, postReactions, isRepostsDisabled, isFocused, isHighlighted, searchQueryToHighlight, onForward, className, canDelete, canEdit, openedFromComments, canChangeCommentsPosting, onSizeChange, onSend, onEditSendTime, }) => {
    const featureFlags = useFeatureFlags();
    const { screenRoute, navigate } = useRouter();
    const peer = usePeer(signerId);
    const signerName = peer ? Peer.name(peer) : undefined;
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const { isMobileLayout } = useLayoutData();
    const { vkm_channel_warning_modals } = useFeatureFlags();
    const getMediaAttachLinkPayload = useCallback((params) => {
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
    const [isFakeNewsModerationModalShown, setIsFakeNewsModerationModal] = useState(false);
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
        return (React.createElement(ChannelPostWrapper, { isCommunityChannel: isCommunityChannel, isRepostsDisabled: isRepostsDisabled, onForward: onForward, channelId: channelId, isChannelArchived: isChannelArchived, post: post, onSend: onSend, onEditSendTime: onEditSendTime, postReactions: postReactions, onReactionClick: handleReactionClick, className: "ChannelPostPrimaryDeleted__wrapper", wrapperClassName: cx('ChannelPostPrimary__actions', {
                'ChannelPostPrimary__actions--tap': isMobileLayout,
                'ChannelPostPrimary__actions--noForward': isRepostsDisabled || !onForward,
            }), canDelete: canDelete, canChangeCommentsPosting: canChangeCommentsPosting, canPostComments: post.comments.canPost, postHasDonutPlaceholder: postHasDonutPlaceholder, canEdit: canEdit },
            React.createElement(ChannelPostPrimaryHighlightWrapper, { isActive: isHighlighted },
                React.createElement(ChannelPostPrimaryDeleted, { reason: post.deleteInfo?.reason, details: post.deleteInfo?.details }))));
    }
    return (React.createElement(ChannelPostWrapper, { className: cx('ChannelPostPrimary__wrapper', className, {
            'ChannelPostPrimary__wrapper--tap': isMobileLayout,
            'ChannelPostPrimary__wrapper--hasText': post.chunks.length !== 0,
            'ChannelPostPrimary--fitMediaAttachesWidth': useCSSMinContentWidth,
        }), isRepostsDisabled: isRepostsDisabled, onForward: onForward, channelId: channelId, isChannelArchived: isChannelArchived, isCommunityChannel: isCommunityChannel, post: post, onSend: onSend, onEditSendTime: onEditSendTime, postReactions: postReactions, onReactionClick: handleReactionClick, wrapperClassName: cx('ChannelPostPrimary__actions', {
            'ChannelPostPrimary__actions--tap': isMobileLayout,
            'ChannelPostPrimary__actions--noForward': isRepostsDisabled || !onForward,
        }), canDelete: canDelete, canChangeCommentsPosting: canChangeCommentsPosting, canPostComments: post.comments.canPost, postHasDonutPlaceholder: postHasDonutPlaceholder, canEdit: canEdit, width: hasMediaAttaches || attaches.wall ? attachWidth : undefined },
        React.createElement(ChannelPostPrimaryHighlightWrapper, { isActive: isHighlighted },
            React.createElement("div", { className: "ChannelPostPrimary" },
                React.createElement(ChannelPostContentWrapper, { className: cx('ChannelPostPrimary__content', {
                        'ChannelPostPrimary__content--hasDonutPlaceholder': postHasDonutPlaceholder,
                    }) },
                    post.kind === 'Normal' &&
                        post.fakeNews &&
                        vkm_channel_warning_modals && (React.createElement(Button, { "data-testid": "channel_post_content_false_information_button", stretched: true, mode: "secondary", size: "s", appearance: "neutral", before: React.createElement(Icon16InfoOutline, null), className: "ChannelPostPrimary__falseInformationButton", onClick: () => setIsFakeNewsModerationModal(true) },
                        React.createElement("span", { className: "ChannelPostPrimary__falseInformationButtonContent" }, lang.use('me_channel_post_content_false_information_button_text')))),
                    postHasDonutPlaceholder && (React.createElement(ChannelPostDonutPlaceholder, { paywall: post.donut?.paywall, placeholder: post.donut?.placeholder })),
                    (signerName ||
                        (post.donut?.isDonut && !postHasDonutPlaceholder) ||
                        post.ads.markedAsAds) && (React.createElement("div", { className: "ChannelPostPrimary__marks" },
                        post.ads.markedAsAds && (React.createElement(ChannelLabel, { withBackdrop: false, labelIcon: React.createElement(Icon16Advertising, { width: 12, height: 12 }), text: lang.use('me_channel_ad_mark') })),
                        signerName && React.createElement(ChannelPostAuthor, { name: signerName }),
                        post.donut?.isDonut && !postHasDonutPlaceholder && (React.createElement(ChannelLabel, { withBackdrop: false, labelIcon: React.createElement(Icon12StarCircleFillYellow, null), text: lang.use('me_channel_donut_mark') })))),
                    hasMediaAttaches && !hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { attaches: attaches, className: cx('ChannelPostPrimary__mediaAttaches', {
                            'ChannelPostPrimary__mediaAttaches--withSigner': Boolean(signerName) || post.ads.markedAsAds,
                            'ChannelPostPrimary__mediaAttaches--withPublicVideo': hasPublicVideo,
                            'ChannelPostPrimary__mediaAttaches--withDonut': Post.isDonut(post),
                        }), hidePublicVideoInfo: true, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handleAttachesWidthChange })),
                    React.createElement("div", { className: "ChannelPostPrimary__mainContent" },
                        post.chunks && (React.createElement(PostText, { channelId: channelId, chunks: post.chunks, isFocused: isFocused, isCommunityChannel: isCommunityChannel, searchQueryToHighlight: searchQueryToHighlight, ...HIGHLIGHTER_STYLES_ACCENT })),
                        hasMediaAttaches && hasPublicVideo && (React.createElement(ChannelPostMediaAttaches, { attaches: attaches, className: cx('ChannelPostPrimary__mediaAttaches', {
                                'ChannelPostPrimary__mediaAttaches--withSigner': Boolean(signerName),
                                'ChannelPostPrimary__mediaAttaches--withPublicVideo': hasPublicVideo,
                                'ChannelPostPrimary__mediaAttaches--withDonut': Post.isDonut(post),
                            }), getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handleAttachesWidthChange })),
                        React.createElement(ChannelPostAttaches, { className: "ChannelPostPrimary__attaches", attaches: attaches, channelId: channelId, postCmid: post.cmid, updatedAt: post.kind === 'Normal' ? post.updatedAt : undefined, withSearchHighlight: isFocused, searchQueryToHighlight: searchQueryToHighlight, isPrimary: isPrimaryAttaches, withBubblesTheme: true, getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handleAttachesWidthChange, ...HIGHLIGHTER_STYLES_ACCENT })),
                    React.createElement("div", { className: "ChannelPostPrimary__footer" },
                        React.createElement("div", { className: "ChannelPostPrimary__reactions" }, post.kind === 'Normal' && (React.createElement(ChannelReactions, { post: post, channelId: channelId, postReactions: postReactions }))),
                        React.createElement(ChannelPostMeta, { className: "ChannelPostPrimary__meta", sentAt: post.sentAt, views: post.kind === 'Normal' ? post.views : undefined, updatedAt: post.kind === 'Normal' ? post.updatedAt : undefined, float: postHasDonutPlaceholder })),
                    !openedFromComments && (React.createElement(ChannelPostPrimaryComments, { postKind: post.kind, count: 'count' in post.comments ? post.comments.count : undefined, canView: post.comments.canView, canClose: post.comments.canClose, onCommentsClick: handleCommentsClick }))))),
        isFakeNewsModerationModalShown && (React.createElement(ChannelModerationModals, { activeModal: "FalsePostInformationModal" /* CHANNEL_MAIN_MODALS.FALSE_POST_INFORMATION_MODAL */, channelId: channelId, onClose: () => setIsFakeNewsModerationModal(false) }))));
});
const ChannelPostPrimaryComments = ({ postKind, count, canView, canClose, onCommentsClick, }) => {
    const { lang } = useBrowserEnv();
    const ContentWithComments = (React.createElement("div", { className: "ChannelPostPrimaryComments__content", onClick: onCommentsClick },
        React.createElement("div", { className: 'ChannelPostPrimaryComments__labelWithIcon' },
            React.createElement(Icon16CommentOutline, null),
            React.createElement(Subhead, { weight: "2", useAccentWeight: true }, count
                ? lang.use('me_post_comments_count', {
                    num: count,
                    formatted: 'short',
                })
                : lang.use('me_channel_post_comment'))),
        React.createElement(Icon16Chevron, null)));
    const ContentWithDisabledComments = (React.createElement("div", { className: "ChannelPostPrimaryComments__content ChannelPostPrimaryComments__content--disabled" },
        React.createElement(Icon24CommentSlashOutline, null),
        React.createElement(Subhead, { weight: "2", useAccentWeight: true }, lang.use('me_channel_postponed_post_comments_disabled'))));
    const isNormalPostWithComments = postKind === 'Normal' && canView;
    const isPostponedPostWithDisabledComments = postKind === 'Postponed' && !canClose;
    const Content = isNormalPostWithComments
        ? ContentWithComments
        : isPostponedPostWithDisabledComments
            ? ContentWithDisabledComments
            : null;
    if (!Content) {
        return;
    }
    return (React.createElement("div", { className: "ChannelPostPrimaryComments" },
        React.createElement(Separator, { className: "ChannelPostPrimaryComments__separator" }),
        Content));
};
const ChannelPostPrimaryDeleted = ({ reason, details, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: "ChannelPostPrimary" },
        React.createElement(ChannelPostContentWrapper, { className: "ChannelPostPrimary__content" },
            React.createElement("div", { className: "ChannelPostPrimaryDeleted" },
                React.createElement("div", { className: "ChannelPostPrimaryDeleted__icon" },
                    React.createElement(Icon56BlockOutline, null)),
                React.createElement("div", { className: "ChannelPostPrimaryDeleted__title" }, reason ?? lang.use('me_channel_post_deleted')),
                details && (React.createElement("div", { className: "ChannelPostPrimaryDeleted__desc" }, details))))));
};
//# sourceMappingURL=ChannelPostPrimary.js.map