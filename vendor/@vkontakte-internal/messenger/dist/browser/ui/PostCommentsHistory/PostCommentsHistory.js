import '../../ui/PostCommentsHistory/PostCommentsHistory.css';
import React, { memo, useCallback, useEffect, useMemo, useState, } from 'react';
import * as Post from '../../../core/model/Post';
import * as Peer from '../../../core/model/Peer';
import * as Reaction from '../../../core/model/ReactionOld';
import { OptionsListSelect, OptionsListSelectItem, OptionsListSelectTrigger, } from '../../ui/OptionsListSelect/OptionsListSelect';
import { PostCommnentWithHighlight, } from '../../ui/PostComment/PostComment';
import { CommentNegativePlaceholder } from '../../ui/PostCommentNegativePlaceholder/PostCommentNegativePlaceholder';
import { Icon16Down, Icon16Up, Icon24CheckCircleOutline, } from '@vkontakte/icons';
import cx from 'classnames';
import { useBrowserEnv, useChannelsContentOptions, useDidUpdate, useDispatch, useFeatureFlags, useOwner, usePeer, usePrevious, } from '../../hooks/misc';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { getCommentsHistoryLockKey } from '../../../data/store/UserLoadedCommentsHistory';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ReportCommentModal } from '../../ui/ReportModal/ReportModal';
import { useModal } from '../../hooks/useModal';
import { PeersListModal } from '../../ui/PeersListModal/PeersListModal';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { BanModal } from '../../ui/BanModal/BanModal';
import { fromApiChannelMember } from '../../../data/converter/ChannelMembersConverter';
import { canDeleteChannelCommentWithReason } from '../../utils/moderation';
import { useApiFetch } from '../../hooks/useApiFetch';
import { Footnote } from '@vkontakte/vkui';
import { Button } from '@vkontakte-internal/vkcom-kit';
const ORDER_OPTIONS = ['interesting', 'old', 'new'];
const COMMUNITY_CHANNEL_ORDER_OPTIONS = ['old', 'new'];
const CLAMP_TEXT_LINES_COUNT = 6;
const LIKE_REACTION_ID = Reaction.resolveId(1);
export const PostCommentsHistory = React.forwardRef(({ post, className, commentsHistoryLocks, adminLevel, commentGroups, isCommunityChannel, highlightId, handleForward, handleHighlightComment, handleReply, }, ref) => {
    const dispatch = useDispatch();
    const { id: ownerId } = useOwner();
    const { lang, contentManagement } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const snackbar = useSnackbar();
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const { vkm_channel_comments_reply, vkm_channels_comment_share, vkm_channel_black_list, vkm_channel_dsbl_delete_thread, vkm_channels_negative_comments, } = useFeatureFlags();
    const contentOptions = useChannelsContentOptions();
    const [channelMembers, setChannelMembers] = useState();
    const reportModal = useModal();
    const likePeersModal = useModal();
    const banModal = useModal();
    const [modalCommentCmid, setModalCommentCmid] = useState(undefined);
    const modalComment = useMemo(() => {
        if (!modalCommentCmid) {
            return;
        }
        return Post.findCommentByCmid(post, modalCommentCmid);
    }, [modalCommentCmid, post]);
    const { comments } = post;
    /**
     * Определяем менялся ли полученный срез комментариев, чтобы поймать
     * момент, когда изменяются каунтеры, но не дозагружается история
     * комментариев.
     *
     * @todo Отказаться от этой проверки после появления события об обновлении
     * истории комментов в ЛП.
     */
    const [hasUpdatedCounters, setHasUpdatedCounters] = useState(false);
    /**
     * Запоминаем предыдущие каунтеры, чтобы реагировать на изменения
     * только в случае явного изменения количества комментариев.
     *
     * @todo Отказаться от этой проверки после появления события об обновлении
     * комментов в ЛП.
     */
    const prevCommentsCount = usePrevious(comments.count);
    useDidUpdate(() => {
        if (hasUpdatedCounters ||
            typeof prevCommentsCount === 'undefined' ||
            prevCommentsCount === comments.count) {
            return;
        }
        setHasUpdatedCounters(true);
    }, [comments.count]);
    /**
     * В случаях, когда каунтеры обновляются через наш шортполл (например,
     * когда другой юзер отправляет коммент к посту), может возникнуть
     * ситуация, когда у нас в истории нет комментариев под эти каунтеры.
     * Т.к. у нас нет ЛП для обновления истории комментариев, а реагировать
     * даже на шортполл каунтеров сродне ящику Пандоры, заводим эту проверку.
     * Без этой проверки мы получали бы бесконечный спиннер (показывать
     * нечего - данных нет, но каунтер изменился) в кейсах, когда
     * комментариев ещё не было, или несоответсвие каунтеров и истории в кейсах,
     * когда история комментов уже наполнена.
     *
     * @todo Отказаться от этой проверки после появления события об обновлении
     * истории комментов в ЛП.
     */
    const hasMismatchingHistory = !hasUpdatedCounters
        ? false
        : !comments.prevFrom &&
            !comments.nextFrom &&
            comments.history.length !== comments.count;
    const isEmpty = hasMismatchingHistory
        ? !comments.history.length
        : !comments.history.length && !comments.count;
    // есть ли плейсхолдер скрытых корневых комментариев
    const rootNegativePlaceholder = vkm_channels_negative_comments
        ? comments.negativeRepliesPlaceholder
        : undefined;
    const isInitialLoading = !hasUpdatedCounters &&
        !comments.history.length &&
        comments.count !== 0 &&
        !rootNegativePlaceholder;
    /** Вычисления фактического кол-ва комментариев в посте (включая ответы к ним) */
    const commentsCount = useMemo(() => {
        const fromApi = comments.count;
        const fromHistory = comments.history.reduce((acc, comment) => {
            const repliesCount = comment.replies.history.length;
            const commentWithRepliesCount = 1 + repliesCount;
            return acc + commentWithRepliesCount;
        }, 0);
        return Math.max(fromApi, fromHistory);
    }, [comments]);
    const isLoadingMore = commentsHistoryLocks.has(getCommentsHistoryLockKey(post.channelId, post.cmid, comments.order));
    const handleReportModalClose = useCallback(() => {
        reportModal.close();
        setModalCommentCmid(undefined);
    }, [reportModal]);
    const handleLikePeersModalClose = useCallback(() => {
        likePeersModal.close();
        setModalCommentCmid(undefined);
    }, [likePeersModal]);
    const handleBanModalClose = useCallback(() => {
        banModal.close();
        setModalCommentCmid(undefined);
    }, [banModal]);
    const handleReportConfirm = useCallback((reasonId) => {
        if (!modalComment) {
            return;
        }
        dispatch({
            type: 'UserChangedComment',
            channelId: modalComment.channelId,
            postCmid: modalComment.postCmid,
            commentCmid: modalComment.cmid,
            userAction: {
                kind: 'report',
                reason: reasonId,
            },
        });
        snackbar({
            message: lang.use('me_report_channel_modal_success'),
            before: (React.createElement(Icon24CheckCircleOutline, { fill: "var(--vkui--color_icon_positive--active)" })),
        });
        handleReportModalClose();
    }, [dispatch, handleReportModalClose, lang, modalComment, snackbar]);
    const handlePeerBan = ({ reason, comment, endDate, isCommentVisible, }) => {
        if (modalComment?.kind !== 'MarkedDeleted') {
            return;
        }
        dispatch({
            type: 'UserBannedChannelPeer',
            channelId: modalComment.channelId,
            peerId: modalComment.peerId,
            comment,
            endDate,
            isCommentVisible,
            reason,
            banTarget: {
                postCmid: modalComment.postCmid,
                commentCmid: modalComment.cmid,
            },
        });
        handleBanModalClose();
    };
    const handleCommentAction = useCallback((action, comment) => {
        switch (action) {
            case 'delete': {
                dispatch({
                    type: 'UserChangedComment',
                    userAction: {
                        kind: 'delete',
                    },
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    commentCmid: comment.cmid,
                });
                break;
            }
            case 'deleteThread': {
                dispatch({
                    type: 'UserChangedComment',
                    userAction: {
                        kind: 'deleteThread',
                    },
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    commentCmid: comment.cmid,
                });
                break;
            }
            case 'edit': {
                if (comment.kind !== 'Normal') {
                    break;
                }
                dispatch({
                    type: 'UserChangedCommentsComposerDraft',
                    kind: 'editing',
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    editing: comment,
                });
                break;
            }
            case 'forward': {
                if (comment.kind !== 'Normal') {
                    break;
                }
                handleForward(comment);
                break;
            }
            case 'reply': {
                if (comment.kind !== 'Normal') {
                    break;
                }
                dispatch({
                    type: 'UserChangedCommentsComposerDraft',
                    kind: 'reply',
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    reply: comment,
                });
                handleReply?.(comment.cmid);
                break;
            }
            case 'report': {
                if (comment.kind !== 'Normal' && comment.kind !== 'MarkedDeleted') {
                    break;
                }
                reportModal.open();
                setModalCommentCmid(comment.cmid);
                break;
            }
            case 'restore': {
                dispatch({
                    type: 'UserChangedComment',
                    userAction: {
                        kind: 'restore',
                    },
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    commentCmid: comment.cmid,
                });
                break;
            }
            case 'restoreThread': {
                dispatch({
                    type: 'UserChangedComment',
                    userAction: {
                        kind: 'restoreThread',
                    },
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    commentCmid: comment.cmid,
                });
                break;
            }
            case 'like': {
                if (comment.kind !== 'Normal') {
                    break;
                }
                dispatch({
                    type: 'UserChangedLike',
                    kind: 'comment',
                    channelId: comment.channelId,
                    postCmid: comment.postCmid,
                    commentCmid: comment.cmid,
                    reactionId: comment.likes.reactionId === undefined
                        ? LIKE_REACTION_ID
                        : undefined,
                });
                break;
            }
            case 'ban': {
                if (comment.kind !== 'MarkedDeleted') {
                    break;
                }
                banModal.open();
                setModalCommentCmid(comment.cmid);
                break;
            }
            case 'unban': {
                if (comment.kind !== 'MarkedDeleted') {
                    break;
                }
                dispatch({
                    type: 'UserUnbannedChannelPeer',
                    channelId: comment.channelId,
                    peerId: comment.peerId,
                    banTarget: {
                        postCmid: comment.postCmid,
                        commentCmid: comment.cmid,
                    },
                });
                break;
            }
            case 'delete_with_reason': {
                contentManagement?.deleteWithReason({
                    objectType: 15 /* IContentManagement.ObjectType.CommunityChannelComment */,
                    objectId: comment.cmid,
                    objectOwnerId: comment.channelId,
                });
                break;
            }
            default:
                exhaustivenessCheck(action);
        }
    }, [
        banModal,
        contentManagement,
        dispatch,
        handleForward,
        reportModal,
        handleReply,
    ]);
    const handleGetIsActionAvailable = useCallback((action, comment) => {
        switch (action) {
            case 'delete': {
                if (comment.kind !== 'Normal') {
                    return false;
                }
                const isCommentOwner = comment.peerId === ownerId;
                const isEnoughAdminLevel = adminLevel >= 1 /* Peer.GroupAdminLevel.Moderator */;
                const isManagedGroupComment = Peer.isGroupPeerId(comment.peerId) &&
                    commentGroups.has(comment.peerId);
                return isCommentOwner || isEnoughAdminLevel || isManagedGroupComment;
            }
            case 'deleteThread': {
                if (vkm_channel_dsbl_delete_thread) {
                    return false;
                }
                if (comment.kind !== 'MarkedDeleted' &&
                    comment.kind !== 'Deleted') {
                    return false;
                }
                const isEnoughAdminLevel = adminLevel >= 1 /* Peer.GroupAdminLevel.Moderator */;
                if (!isEnoughAdminLevel) {
                    return false;
                }
                if (comment.replies.history.filter((comment) => comment.kind === 'Normal').length === 0) {
                    return false;
                }
                return !comment.isThreadDeleted;
            }
            case 'edit': {
                return comment.canEdit && post.comments.canPost;
            }
            case 'forward': {
                if (isCommunityChannel) {
                    return vkm_channels_comment_share;
                }
                return true;
            }
            case 'reply': {
                return vkm_channel_comments_reply && post.comments.canPost;
            }
            case 'report': {
                if (comment.kind !== 'Normal' && comment.kind !== 'MarkedDeleted') {
                    return false;
                }
                if (comment.peerId === ownerId ||
                    Peer.resolveId(comment.channelId) === comment.peerId) {
                    return false;
                }
                // проверяем на наличие роли (админ, редактор, создатель, редактор)
                // запрещаем жаловаться на таких юзеров
                const commentAuthorRole = channelMembers?.get(comment.peerId)?.role;
                if (commentAuthorRole) {
                    return false;
                }
                return comment.peerId !== ownerId;
            }
            case 'restore': {
                return comment.kind === 'MarkedDeleted' && !comment.isThreadDeleted;
            }
            case 'restoreThread': {
                if (vkm_channel_dsbl_delete_thread) {
                    return false;
                }
                return ((comment.kind === 'MarkedDeleted' ||
                    comment.kind === 'Deleted') &&
                    comment.isThreadDeleted);
            }
            case 'like': {
                return comment.kind === 'Normal';
            }
            case 'ban':
            case 'unban': {
                if (!vkm_channel_black_list) {
                    return false;
                }
                if (comment.kind !== 'MarkedDeleted' ||
                    (action === 'ban' ? comment.isPeerBanned : !comment.isPeerBanned)) {
                    return false;
                }
                if (adminLevel < 1 /* Peer.GroupAdminLevel.Moderator */) {
                    return false;
                }
                if (comment.peerId === ownerId ||
                    Peer.resolveId(comment.channelId) === comment.peerId) {
                    return false;
                }
                const isCommentAuthorAdmin = channelMembers?.get(comment.peerId)?.isAdmin;
                return !isCommentAuthorAdmin;
            }
            case 'delete_with_reason': {
                return Boolean(isCommunityChannel &&
                    canDeleteChannelCommentWithReason(contentOptions));
            }
            default:
                exhaustivenessCheck(action);
        }
    }, [
        adminLevel,
        commentGroups,
        vkm_channel_black_list,
        vkm_channels_comment_share,
        vkm_channel_comments_reply,
        vkm_channel_dsbl_delete_thread,
        ownerId,
        post.comments.canPost,
        channelMembers,
        contentOptions,
        isCommunityChannel,
    ]);
    const handleLoadMoreLikePeers = useCallback((comment) => {
        dispatch({
            type: 'UserLoadedLikes',
            kind: 'comment',
            channelId: comment.channelId,
            postCmid: comment.postCmid,
            commentCmid: comment.cmid,
        });
    }, [dispatch]);
    const loadInitialHistory = useCallback((order, force) => {
        if (order === comments.order && !force) {
            return;
        }
        dispatch({
            type: 'UserLoadedCommentsHistory',
            channelId: post.channelId,
            postCmid: post.cmid,
            order,
            direction: 'forward',
        });
    }, [dispatch, post.channelId, post.cmid, comments.order]);
    const loadMoreHistory = useCallback((direction, commentCmid) => {
        dispatch({
            type: 'UserLoadedCommentsHistory',
            channelId: post.channelId,
            postCmid: post.cmid,
            order: post.comments.order,
            rootCommentCmid: commentCmid,
            direction,
        });
    }, [dispatch, post.channelId, post.cmid, post.comments.order]);
    const openLikePeersModal = useCallback((comment) => {
        if (comment.kind !== 'Normal') {
            return;
        }
        likePeersModal.open();
        setModalCommentCmid(comment.cmid);
    }, [likePeersModal]);
    useEffect(() => {
        dispatch({
            type: 'UserInvalidatedCommentsHistory',
            channelId: post.channelId,
            postCmid: post.cmid,
        });
        // Запускаем при маунте компонента, чтобы загрузить начальную историю или обновить в фоне комменты
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        const fetchChannelMembers = async () => {
            try {
                if (adminLevel >= 1 /* Peer.GroupAdminLevel.Moderator */) {
                    const response = await apiFetch('channels.getMembers', {
                        channel_id: post.channelId,
                    });
                    const extendedMembers = new Map([]);
                    response.items.forEach((item) => {
                        const peerId = Peer.resolveId(item.id);
                        if (!Peer.isUserPeerId(peerId)) {
                            return;
                        }
                        if (extendedMembers.has(peerId)) {
                            return;
                        }
                        const member = fromApiChannelMember(item);
                        extendedMembers.set(member.id, member);
                    });
                    setChannelMembers(extendedMembers);
                }
            }
            catch { }
        };
        fetchChannelMembers();
    }, [adminLevel, apiFetch, post.channelId]);
    const orderOptions = Post.isFromCommunityChannel(post)
        ? COMMUNITY_CHANNEL_ORDER_OPTIONS
        : ORDER_OPTIONS;
    const renderListContent = () => {
        if (isInitialLoading) {
            return (React.createElement(OptimizedSpinner, { className: "PostCommentsHistory__initialSpinner", intersectionOptions: {
                    triggerOnce: true,
                    initialInView: true,
                }, size: "m" }));
        }
        return (React.createElement("div", { className: "PostCommentsHistory__content" },
            comments.prevFrom && (React.createElement(LoadMoreCommentsButton, { isLoading: isLoadingMore, direction: "backward", onClick: () => loadMoreHistory('backward') })),
            React.createElement(CommentsList, { commentsHistoryLocks: commentsHistoryLocks, history: comments.history, selectedOrder: post.comments.order, highlightId: highlightId, getIsActionAvailable: handleGetIsActionAvailable, onLoadMore: loadMoreHistory, onAction: handleCommentAction, onLoadMoreLikePeers: handleLoadMoreLikePeers, onLikeModalOpen: openLikePeersModal, onCommentHiglight: handleHighlightComment, onLoadHiddenRoot: () => loadMoreHistory('forward'), negativePlaceholder: rootNegativePlaceholder, isLoadingHiddenRoot: isLoadingMore }),
            comments.nextFrom && !rootNegativePlaceholder && (React.createElement(LoadMoreCommentsButton, { isLoading: isLoadingMore, direction: "forward", onClick: () => loadMoreHistory('forward') }))));
    };
    const renderContent = () => {
        if (isEmpty) {
            return (React.createElement("span", { className: "PostCommentsHistory__emptyPlaceholder" }, lang.use('me_channel_post_no_comments')));
        }
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "PostCommentsHistory__header" },
                React.createElement(Footnote, { caps: true, className: 'PostCommentHistory__commentsCounter' }, lang.use('me_post_comments_count', {
                    num: commentsCount,
                    formatted: 'short',
                })),
                commentsCount !== 1 && (React.createElement(CommentsOrderingSelector, { orderOptions: orderOptions, selectedOrder: comments.order, onClick: loadInitialHistory, disabled: isLoadingMore }))),
            renderListContent()));
    };
    return (React.createElement("div", { ref: ref, className: cx(className, 'PostCommentsHistory', {
            'PostCommentsHistory--empty': isEmpty,
            'PostCommentsHistory--withoutBubbles': isWithoutBubblesTheme,
        }) },
        renderContent(),
        reportModal.isActive &&
            (modalComment?.kind === 'Normal' ||
                modalComment?.kind === 'MarkedDeleted') && (React.createElement(ReportCommentModal, { sourceOwnerId: modalComment.channelId, comment: modalComment, onClose: handleReportModalClose, onReport: handleReportConfirm })),
        likePeersModal.isActive && modalComment?.kind === 'Normal' && (React.createElement(CommentLikePeersModal, { comment: modalComment, onClose: handleLikePeersModalClose, onLoadMore: handleLoadMoreLikePeers })),
        banModal.isActive && modalComment?.kind === 'MarkedDeleted' && (React.createElement(BanModal, { isUserMemberOfChannel: Boolean(channelMembers?.has(modalComment.peerId)), peerId: modalComment.peerId, onSubmit: handlePeerBan, onClose: handleBanModalClose }))));
});
const CommentsOrderingSelector = ({ selectedOrder, disabled, onClick, orderOptions, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement(OptionsListSelect, { className: "CommentsOrderingSelector", adaptive: true, hideOnClick: true, options: React.createElement(React.Fragment, null, orderOptions.map((order) => (React.createElement(OptionsListSelectItem, { key: order, title: lang.use(`me_comments_order_${order}`), onClick: () => onClick(order), isSelected: order === selectedOrder, disabled: disabled })))) },
        React.createElement(OptionsListSelectTrigger, { colored: true, withIcon: true, selectedKey: lang.use(`me_comments_order_${selectedOrder}`) })));
};
const LoadMoreCommentsButton = ({ onClick, direction, isLoading }) => {
    const { lang } = useBrowserEnv();
    const beforeIcon = useMemo(() => {
        return direction === 'forward' ? (React.createElement("i", { role: "img", className: "PostCommentsHistory__loadMoreButtonIcon" },
            React.createElement(Icon16Down, null),
            ' ')) : (React.createElement("i", { role: "img", className: "PostCommentsHistory__loadMoreButtonIcon" },
            React.createElement(Icon16Up, null),
            ' '));
    }, [direction]);
    return (React.createElement(Button, { onClick: onClick, "aria-label": lang.use('me_comments_load_more'), before: beforeIcon, mode: "secondary", appearance: "accent", loading: isLoading }, lang.use('me_comments_load_more')));
};
const LoadMoreRepliesButton = ({ onClick, isLoading, moreRepliesCounter, children }) => {
    const { lang } = useBrowserEnv();
    const defaultLabel = lang.use('me_comments_show_n_replies', {
        num: moreRepliesCounter || 1,
        formatted: 'short',
    });
    return (React.createElement("div", null,
        React.createElement(Button, { loading: isLoading, mode: "link", className: 'PostCommentsHistory__loadMoreButton', onClick: onClick, "data-testId": "post_comments_more_replies_button" }, children ?? defaultLabel)));
};
const CommentsList = ({ className, history, isCompact = false, commentsHistoryLocks, selectedOrder, highlightId, getIsActionAvailable, onAction, onLoadMore, onLoadMoreLikePeers, onLikeModalOpen, onCommentHiglight, negativePlaceholder, onLoadHiddenRoot, isLoadingHiddenRoot, }) => {
    return (React.createElement("div", { className: cx('CommentsList', className) },
        history.map((comment, index) => (React.createElement(CommentsListItem, { key: comment.cmid, comment: comment, highlightId: highlightId, isCompact: isCompact, isLoadingReplies: commentsHistoryLocks?.has(getCommentsHistoryLockKey(comment.channelId, comment.postCmid, selectedOrder, comment.cmid)), selectedOrder: selectedOrder, getIsActionAvailable: getIsActionAvailable, onAction: onAction, onLoadMore: onLoadMore, onLoadMoreLikePeers: onLoadMoreLikePeers, onLikeModalOpen: onLikeModalOpen, onCommentHiglight: onCommentHiglight, hideFirstReplyLabel: index === 0 }))),
        Boolean(negativePlaceholder) && (React.createElement(HiddenCommentsPlaceholder, { placeholder: negativePlaceholder, onClick: onLoadHiddenRoot, isLoading: isLoadingHiddenRoot }))));
};
const CommentsListItem = memo(({ comment, isCompact, hideReplies, hideFirstReplyLabel, isLoadingReplies, selectedOrder, highlightId, getIsActionAvailable, onLoadMore, onAction, onLoadMoreLikePeers, onLikeModalOpen, onCommentHiglight, }) => {
    const featureFlags = useFeatureFlags();
    const isThreadDeleted = (comment.kind === 'MarkedDeleted' || comment.kind === 'Deleted') &&
        comment.isThreadDeleted;
    const threadNegativePlaceholder = featureFlags.vkm_channels_negative_comments
        ? comment.replies.negativeRepliesPlaceholder
        : undefined;
    const showReplies = !hideReplies &&
        !isThreadDeleted &&
        (comment.replies.history.length !== 0 ||
            Boolean(threadNegativePlaceholder));
    const clampTextLinesCount = featureFlags.vkm_channel_comments_clamp
        ? CLAMP_TEXT_LINES_COUNT
        : undefined;
    const handleGetIsActionAvailable = useCallback((action) => getIsActionAvailable(action, comment), [comment, getIsActionAvailable]);
    const handleAction = useCallback((action) => onAction?.(action, comment), [comment, onAction]);
    const handleLoadMoreLikePeers = useCallback(() => onLoadMoreLikePeers?.(comment), [comment, onLoadMoreLikePeers]);
    const handleLikeModalOpen = useCallback(() => onLikeModalOpen?.(comment), [comment, onLikeModalOpen]);
    const handleReplyLabelClick = useCallback((commentId) => {
        onCommentHiglight?.(commentId);
    }, [onCommentHiglight]);
    return (React.createElement(React.Fragment, null,
        React.createElement(PostCommnentWithHighlight, { isActive: comment.cmid === highlightId, "data-commentcmid": comment.cmid, className: cx('CommentsListItem__comment', {
                'CommentsListItem__comment--compact': isCompact,
            }), comment: comment, hideFirstReplyLabel: hideFirstReplyLabel, clampTextLines: clampTextLinesCount, isCompact: isCompact, getIsActionAvailable: handleGetIsActionAvailable, onAction: handleAction, onLoadMoreLikePeers: handleLoadMoreLikePeers, onLikeModalOpen: handleLikeModalOpen, onReplyLabelClick: handleReplyLabelClick }),
        showReplies && (React.createElement("div", { className: "CommentsListItem__replies" },
            comment.replies.prevFrom && (React.createElement(LoadMoreRepliesButton, { isLoading: isLoadingReplies, direction: "backward", onClick: () => onLoadMore?.('backward', comment.cmid), moreRepliesCounter: comment.replies.count - comment.replies.history.length })),
            React.createElement(CommentsList, { isCompact: true, highlightId: highlightId, history: comment.replies.history, withSeparators: true, selectedOrder: selectedOrder, onLoadMore: onLoadMore, getIsActionAvailable: getIsActionAvailable, onAction: onAction, onLoadMoreLikePeers: onLoadMoreLikePeers, onLikeModalOpen: onLikeModalOpen, onCommentHiglight: onCommentHiglight }),
            comment.replies.nextFrom && !threadNegativePlaceholder && (React.createElement(LoadMoreRepliesButton, { isLoading: isLoadingReplies, direction: "forward", onClick: () => onLoadMore?.('forward', comment.cmid), moreRepliesCounter: comment.replies.count - comment.replies.history.length })),
            Boolean(threadNegativePlaceholder) && (React.createElement(LoadMoreRepliesButton, { isLoading: isLoadingReplies, onClick: () => onLoadMore?.('forward', comment.cmid) }, threadNegativePlaceholder?.title))))));
});
const CommentLikePeersModal = ({ comment, onLoadMore, onClose, }) => {
    const { id: ownerId } = useOwner();
    const { lang } = useBrowserEnv();
    const author = usePeer(comment.peerId, true);
    const isLiked = comment.likes.reactionId !== undefined;
    const likesCount = comment.likes.count;
    const peerIds = useMemo(() => {
        return [...(isLiked ? [ownerId] : []), ...comment.likes.peerIds];
    }, [comment.likes.peerIds, isLiked, ownerId]);
    return (React.createElement(PeersListModal, { title: lang.use('me_peers_liked_modal_title', {
            values: {
                formatted: Peer.firstName(author, 'gen'),
            },
        }), peerIds: peerIds, onLoadMore: () => onLoadMore(comment), onClose: onClose, onItemClick: onClose, hasMore: peerIds.length !== likesCount - (isLiked ? 1 : 0) }));
};
/* плашка для скрытых КОРНЕВЫХ комментариев поста */
const HiddenCommentsPlaceholder = ({ placeholder, onClick, isLoading, }) => {
    if (!placeholder) {
        return null;
    }
    return (React.createElement(CommentNegativePlaceholder, { className: "CommentsListItem__comment", placeholder: placeholder, onClick: onClick, isLoading: isLoading }));
};
//# sourceMappingURL=PostCommentsHistory.js.map