import '../../ui/ChannelPostComments/ChannelPostComments.css';
import React, { memo, useCallback, useEffect, useRef, } from 'react';
import * as Comment from '../../../core/model/Comment';
import * as Post from '../../../core/model/Post';
import * as Channel from '../../../core/model/Channel';
import * as History from '../../../core/model/History';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { useDispatch, useLayoutDidUpdate, useFeatureFlags, useLock, useStoreState, } from '../../hooks/misc';
import { ChannelPostCommentsHeader } from '../../ui/ChannelHeader/ChannelHeader';
import { ChannelPostMarkedDeleted } from '../../ui/ChannelPost/ChannelPost';
import { PostCommentsHistory } from '../../ui/PostCommentsHistory/PostCommentsHistory';
import cx from 'classnames';
import { useRouter } from '../../ui/Router/Router';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { CommentsComposer } from '../../ui/CommentsComposer/CommentsComposer';
import { useCommentsComposerDraft } from '../../hooks/useComposerDraft';
import { DropAreaProvider } from '../../ui/DropArea/DropArea';
import { useDropAreaState } from '../../ui/DropArea/useDropAreaState';
import { getCommentsHistoryLockKey } from '../../../data/store/UserLoadedCommentsHistory';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ChannelPostPrimary } from '../../ui/ChannelPostPrimary/ChannelPostPrimary';
import { ChannelPostSecondary } from '../../ui/ChannelPostSecondary/ChannelPostSecondary';
import { CHANNEL_POST_HISTORY_HORIZONTAL_PADDING, CHANNEL_POST_HISTORY_HORIZONTAL_PADDING_LARGE, } from '../../ui/ChannelPostsHistory/ChannelPostsHistory';
import { StickersPopupRootContainer } from '../../ui/StickersPopupRootContainer/StickersPopupRootContainer';
import { useActiveConvoTopPlayerType } from '../../ui/ConvoTopPlayer/ConvoTopPlayer';
import { BannerPanel } from '../../ui/BannerPanel/BannerPanel';
import { CommentsAudiosPlaylistProvider } from '../../ui/Playlists/ConvoAudiosPlaylistContext';
import { ChannelTopPlayer } from '../../ui/ChannelTopPlayer/ChannelTopPlayer';
import { useCurrentThemeStyle } from '../../hooks/useCurrentThemeStyle';
import { useThemeStylesOverride } from '../../hooks/useThemeStylesOverride';
import { ThemeBackgroundResizeable } from '../../ui/ThemeBackground/ThemeBackground';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { PopupAnimationDeductibleElementWrapper } from '../../ui/PopupAnimationDeductibleElementWrapper/PopupAnimationDeductibleElementWrapper';
export const ChannelPostComments = memo(({ className, channel, postCmid, isSending, highlightId, handleForward, handleHighlightComment, postReactions, onForward, hidePlayerOnMusicPlayback, }) => {
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const commentsComposerDraft = useCommentsComposerDraft(channel.id, postCmid);
    const node = History.findNodeByCmid(channel.history, postCmid);
    const $wrapper = useRef(null);
    const $historyWrapper = useRef(null);
    const { navigate, screenRoute } = useRouter();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const isCommunityChannel = Channel.isCommunityChannel(channel);
    const commentsHistoryLocks = useLock('getPostCommentsHistory');
    const commentGroups = useStoreState('commentGroups');
    const isRepostsDisabled = channel.isRepostsDisabled ||
        node.node?.kind !== 'Node' ||
        (featureFlags.vkm_channels_repost_restrictio &&
            (Channel.isRepostsDisabledWithAdditionalRules(channel) ||
                Post.isRepostsDisabledWithAdditionalRules(node.node.item, !!featureFlags.vkm_channel_donut_redesign)));
    const topPlayerType = useActiveConvoTopPlayerType();
    const hideAudioPlayer = hidePlayerOnMusicPlayback && topPlayerType === 'audio';
    const parentRoute = screenRoute.kind === 'ChannelRoute' ? screenRoute.parentRoute : undefined;
    const { isMobileLayout } = useLayoutData();
    const handleCommentsBackButtonClick = () => navigate({
        kind: 'ChannelRoute',
        channelId: channel.id,
        parentRoute,
        organiser: screenRoute.organiser,
    });
    const { dropAreaState, handleDragEnter, hideDropArea } = useDropAreaState();
    const loadHistoryAroundPost = useCallback(() => {
        dispatch({
            type: 'UserScrolledChannelHistory',
            direction: 'around',
            startCmid: postCmid,
            channelId: channel.id,
        });
    }, [channel.id, dispatch, postCmid]);
    const handleCommentSent = useCallback((response) => {
        if ('comment' in response && handleHighlightComment) {
            const commentCmid = Comment.resolveCmid(response.comment?.id);
            handleHighlightComment(commentCmid);
        }
    }, [handleHighlightComment]);
    const { themeAppearance, themeBackground } = useCurrentThemeStyle({});
    const themeAppearanceStyles = useThemeStylesOverride({
        themeAppearance,
    });
    const lastSendCmid = node.node?.kind === 'Node'
        ? node.node.item.comments.lastSendCmid
        : undefined;
    const scrollIntoComment = useCallback((commentId, opts) => {
        if (!$historyWrapper.current || !commentId) {
            return;
        }
        const commentEl = $historyWrapper.current.querySelector(`[data-commentcmid="${commentId}"]`);
        commentEl?.scrollIntoView(opts);
    }, []);
    const handleReplyComment = useCallback((commentId) => {
        scrollIntoComment(commentId, {
            block: 'start',
            behavior: 'smooth',
        });
    }, [scrollIntoComment]);
    // Позиционируемся на только что созданном комментарии
    useLayoutDidUpdate(() => {
        if (lastSendCmid) {
            scrollIntoComment(lastSendCmid, { block: 'center' });
        }
    }, [scrollIntoComment, lastSendCmid]);
    // Позиционируемся на подсвеченном комментарии
    useEffect(() => {
        if (highlightId) {
            scrollIntoComment(highlightId, {
                block: 'start',
                behavior: 'smooth',
            });
        }
    }, [scrollIntoComment, highlightId]);
    const renderContent = () => {
        if (node.status === 'NotLoaded') {
            return (React.createElement(OptimizedSpinner, { className: "ChannelPostComments__spinner", intersectionOptions: {
                    initialInView: true,
                }, size: "m", onIntersection: loadHistoryAroundPost }));
        }
        if (!node.node) {
            return null;
        }
        let historyElement;
        let post = undefined;
        switch (node.node.kind) {
            case 'Node': {
                historyElement = (React.createElement(React.Fragment, null,
                    isWithoutBubblesTheme ? (React.createElement(ChannelPostSecondary, { key: featureFlags.vkm_new_bubbles_width_calc
                            ? node.node.item.updatedAt
                            : undefined, channelId: channel.id, post: node.node.item, channelName: channel.name, signerId: node.node.item.signerId, channelPhoto: channel.photo, isChannelArchived: channel.isArchived, postReactions: postReactions, isRepostsDisabled: isRepostsDisabled, canDelete: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, canEdit: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, canChangeCommentsPosting: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, isCommunityChannel: isCommunityChannel, onForward: onForward, className: "ChannelPostComments__post--secondary", openedFromComments: true })) : (React.createElement(ChannelPostPrimary, { channelId: channel.id, key: featureFlags.vkm_new_bubbles_width_calc
                            ? node.node.item.updatedAt
                            : undefined, post: node.node.item, isCommunityChannel: isCommunityChannel, canDelete: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, canEdit: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */, signerId: node.node.item.signerId, isChannelArchived: channel.isArchived, postReactions: postReactions, isRepostsDisabled: isRepostsDisabled, onForward: onForward, className: "ChannelPostComments__post", openedFromComments: true, canChangeCommentsPosting: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */ })),
                    (node.node.item.comments.canView ||
                        node.node.item.comments.count === 0) && (React.createElement(CommentsAudiosPlaylistProvider, { post: node.node.item },
                        React.createElement(PostCommentsHistory, { className: "ChannelPostComments__history", post: node.node.item, highlightId: highlightId, handleForward: handleForward, handleHighlightComment: handleHighlightComment, handleReply: handleReplyComment, commentsHistoryLocks: commentsHistoryLocks, commentGroups: commentGroups['ids'], adminLevel: channel.adminLevel, isCommunityChannel: isCommunityChannel })))));
                post = node.node.item;
                break;
            }
            case 'DeletedNode': {
                historyElement = (React.createElement(ChannelPostMarkedDeleted, { className: "ChannelPostComments__post", channelId: channel.id, cmid: History.nodeCmid(node.node), canRestore: channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */ }));
                break;
            }
            default:
                exhaustivenessCheck(node.node);
        }
        const POPUP_STICKER_ANIMATION_CONTAINER_ID = 'popup-sticker-chanel-post-comments-container';
        const isPopupStickerAnimationDisabled = !featureFlags.vas_popup_stickers_in_comments;
        return (React.createElement(DropAreaProvider, { ...dropAreaState, onHide: hideDropArea, containerRef: $wrapper },
            React.createElement(ChannelPostCommentsHeader, { className: "ChannelPostComments__header", post: post, onBackClick: handleCommentsBackButtonClick }),
            React.createElement(StickersPopupRootContainer, { isUseAsFullscreen: true, className: "ChannelPostComments__themeWrapper", id: POPUP_STICKER_ANIMATION_CONTAINER_ID, disabled: isPopupStickerAnimationDisabled },
                themeBackground && (React.createElement(ThemeBackgroundResizeable, { themeBackground: themeBackground })),
                React.createElement("div", { className: "ChannelPostComments__banners", "data-popup-sticker-deductible": POPUP_STICKER_ANIMATION_CONTAINER_ID }, topPlayerType === 'audio' && !hideAudioPlayer && (React.createElement(BannerPanel, { mode: "custom", isVisible: true, noBottomBorder: true },
                    React.createElement(ChannelTopPlayer, { type: topPlayerType })))),
                React.createElement("div", { ref: $historyWrapper, className: "ChannelPostComments__wrapper" }, historyElement),
                post?.comments.canPost && (React.createElement(PopupAnimationDeductibleElementWrapper, { className: "ChannelPostComments__composerContainer", popupStickerContainerId: POPUP_STICKER_ANIMATION_CONTAINER_ID, disabled: isPopupStickerAnimationDisabled },
                    React.createElement(CommentsComposer, { className: "ChannelPostComments__composer", channelId: channel.id, isCommunityChannel: isCommunityChannel, postCmid: postCmid, isSending: isSending, isLoading: commentsHistoryLocks.has(getCommentsHistoryLockKey(post.channelId, post.cmid, post.comments.order)), composerDraft: commentsComposerDraft, commentGroups: commentGroups, onCommentSent: handleCommentSent }))))));
    };
    let channelPostHorizontalPadding = CHANNEL_POST_HISTORY_HORIZONTAL_PADDING;
    if (!isMobileLayout && isWithoutBubblesTheme) {
        channelPostHorizontalPadding =
            CHANNEL_POST_HISTORY_HORIZONTAL_PADDING_LARGE;
    }
    return (React.createElement("div", { ref: $wrapper, onDragEnter: handleDragEnter, className: cx(className, 'ChannelPostComments ChannelPostComments--primary', {
            'ChannelPostComments--secondary': isWithoutBubblesTheme,
        }), style: {
            '--channelPostsHistoryContentHorizontalPadding': channelPostHorizontalPadding + 'px',
            ...themeAppearanceStyles,
        } }, renderContent()));
});
ChannelPostComments.displayName = 'ChannelPostComments';
//# sourceMappingURL=ChannelPostComments.js.map