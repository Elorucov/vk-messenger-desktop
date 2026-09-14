import '../../ui/ChannelMain/ChannelMain.css';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useBrowserEnv, useDispatch, useOnChange, useHelpHints, useChannels, useLock, useStoreState, useFeatureFlags, } from '../../hooks/misc';
import { useModal } from '../../hooks/useModal';
import * as Channel from '../../../core/model/Channel';
import * as Post from '../../../core/model/Post';
import * as Peer from '../../../core/model/Peer';
import * as History from '../../../core/model/History';
import { ChannelPostComments } from '../../ui/ChannelPostComments/ChannelPostComments';
import { ChannelPostsHistory } from '../../ui/ChannelPostsHistory/ChannelPostsHistory';
import { ForwardModal } from '../../ui/ForwardModal/ForwardModal';
import { PostReactionAnimationProvider, } from '../../hooks/useMessageReactionAnimation';
import { debounce } from '../../../core/utils/misc';
import { RightPanelContainer } from '../../ui/RightPanel/RightPanelContainer';
import { useStickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickerEmojiMenuProvider } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
import { ChannelPostponedHistory } from '../../ui/ChannelPostponedHistory/ChannelPostponedHistory';
import { useModuleKeyBoardHandlers } from '../../hooks/useKeyBoardHandlers';
import { useRouter } from '../../ui/Router/Router';
import { onElementKeyDownFactory, } from '../../utils/elementKeyDown';
import { ModalDialog } from '../../ui/ModalDialog/ModalDialog';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { ChannelFirstEntryModal } from '../../ui/ChannelFirstEntryModal/ChannelFirstEntryModal';
import { ChannelModerationModals } from '../../ui/ChannelModerationModals/ChannelModerationModals';
export const ChannelMain = React.memo(function ChannelMain({ channel, postCmid, commentCmid, scrollCache, scrollPostponedCache, hidePlayerOnMusicPlayback, openConvo, openChannel, canPinMoreChannels, }) {
    const hints = useHelpHints();
    const { lang } = useBrowserEnv();
    const { vkm_channels_onboarding_folder, vkm_channel_warning_modals, vkm_channel_donut_redesign, } = useFeatureFlags();
    const { screenRoute, navigate } = useRouter();
    const forwardModal = useModal();
    const dispatch = useDispatch();
    const channelsCache = useChannels();
    const postReactions = useStoreState(Channel.isCommunityChannel(channel)
        ? 'newPostingReactions'
        : 'postReactions');
    const commentsSendLocks = useLock('sendComment');
    const [forward, setForward] = useState(null);
    const [highlightId, setHighlightId] = useState();
    const [isForwardFromNewChannel, setIsForwardFromNewChannel] = useState(false);
    const pinChannelErrorModal = useModal();
    const channelFirstEntryModal = useModal();
    const [activeModal, setActiveModal] = useState(null);
    const ref = useRef(null);
    const { subscribeKeyDown, focusHandlerElement } = useModuleKeyBoardHandlers({
        moduleName: 'ChannelMain',
        handlerElementRef: ref,
    });
    const handleClose = useCallback(() => {
        navigate({
            kind: 'MainRoute',
            organiser: screenRoute.organiser,
        });
    }, [navigate, screenRoute.organiser]);
    const handleKeyDown = (keyCombo, event) => {
        if (keyCombo === 'Escape') {
            event.stopPropagation();
            event.preventDefault();
            if (activeModal) {
                setActiveModal(null);
            }
            else {
                handleClose();
            }
        }
    };
    const handlePinChannel = useCallback((channelId) => {
        if (canPinMoreChannels) {
            dispatch({
                type: 'UserChangedChannel',
                channelId,
                userAction: 'pin',
            });
        }
        else {
            pinChannelErrorModal.open();
        }
    }, [canPinMoreChannels, dispatch, pinChannelErrorModal]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => focusHandlerElement(), []);
    useEffect(() => {
        if (!vkm_channel_warning_modals ||
            typeof channel.warningNotification !== 'number') {
            return;
        }
        setActiveModal("ChannelModerationModal" /* CHANNEL_MAIN_MODALS.CHANNEL_MODERATION_MODAL */);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel.warningNotification]);
    useEffect(() => {
        return subscribeKeyDown(handleKeyDown);
    });
    const handlePostForward = useCallback((post) => {
        const donsPaywall = post.donut?.paywall;
        /**
         * Клик на "переслать" предлагает задонатить - всё верно, так повышается конверсия
         */
        if (vkm_channel_donut_redesign && donsPaywall) {
            const vkDonutMiniappParams = Post.getVKDonutMiniappParams(donsPaywall);
            const url = donsPaywall.snippet.button.action?.url;
            /**
             * Бэк вернул ссылку на миниапп вкдонатов
             */
            if (vkDonutMiniappParams) {
                navigate({
                    kind: 'MiniAppModal',
                    miniAppId: vkDonutMiniappParams.miniappId,
                    hash: vkDonutMiniappParams.hash,
                });
                return;
                /**
                 * Бэк вернул ссылку на соо
                 */
            }
            else if (url) {
                window.open(url);
                return;
            }
        }
        setForward({
            kind: "post" /* ComposerDraft.ForwardKind.Post */,
            items: [post],
        });
        const channel = Channel.safeGet(channelsCache, post.channelId);
        if (channel.kind === 'Channel' && Channel.isCommunityChannel(channel)) {
            setIsForwardFromNewChannel(true);
        }
        forwardModal.open();
    }, [vkm_channel_donut_redesign, channelsCache, forwardModal, navigate]);
    const handleCommentForward = useCallback((comment) => {
        setForward({
            kind: "comment" /* ComposerDraft.ForwardKind.Comment */,
            items: [comment],
        });
        forwardModal.open();
    }, [forwardModal]);
    const handleHighlightComment = useCallback((commentId) => {
        setHighlightId(commentId);
        setTimeout(() => setHighlightId(undefined), 1000);
    }, []);
    const handleCancelForward = useCallback(() => {
        setForward(null);
        forwardModal.close();
    }, [forwardModal]);
    const handleShowAdultBanner = useCallback((ageLimitCode) => {
        if (!ageLimitCode) {
            return;
        }
        setActiveModal("AdultContentModal" /* CHANNEL_MAIN_MODALS.ADULT_CONTENT_MODAL */);
    }, [setActiveModal]);
    const [postsHistoryCmid, setPostsHistoryCmid] = useState(postCmid);
    useOnChange(() => {
        if (commentCmid === undefined) {
            setPostsHistoryCmid(postCmid);
        }
    }, [postCmid]);
    const [activeAnimations, setActiveAnimations] = useState([]);
    const setActiveAnimationsDebounced = useMemo(() => debounce(setActiveAnimations, 50, true), []);
    const animationsContextValue = useMemo(() => ({
        activeAnimations,
        setActiveAnimations: setActiveAnimationsDebounced,
    }), [activeAnimations, setActiveAnimationsDebounced]);
    const isChannelPostCommentsVisible = postCmid !== undefined &&
        commentCmid !== undefined &&
        /**
         * В новых каналах нет восстановлени удалённого поста,
         * поэтому и отображать нечего (не будет node)
         */
        History.findNodeByCmid(channel.history, postCmid).node;
    const stickerEmojiMenu = useStickerEmojiMenuPopper();
    const onCloseChannelFirstEntryModal = useCallback(() => {
        dispatch({
            type: 'UserSeenHelpHint',
            hintId: 'im:channels_first_entry',
        });
        channelFirstEntryModal.close();
    }, [dispatch, channelFirstEntryModal]);
    useEffect(() => {
        if (!vkm_channels_onboarding_folder &&
            hints.has('im:channels_first_entry') &&
            !channelFirstEntryModal.isActive) {
            channelFirstEntryModal.open();
        }
        return () => {
            if (channelFirstEntryModal.isActive) {
                channelFirstEntryModal.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hints]);
    useEffect(() => {
        if (channel.isDeleted) {
            navigate({
                kind: 'MainRoute',
                organiser: screenRoute.organiser,
            });
        }
    }, [channel.isDeleted, navigate, screenRoute.organiser]);
    if (channel.isDeleted) {
        return null;
    }
    return (React.createElement(RightPanelContainer, { minCompressedWidth: 550, className: "ChannelMain__rightPanelContainer" },
        React.createElement("div", { className: "ChannelMain", onKeyDown: onElementKeyDownFactory(handleKeyDown), ref: ref, tabIndex: -1 },
            React.createElement(React.Fragment, null,
                React.createElement(PostReactionAnimationProvider, { value: animationsContextValue },
                    React.createElement("div", { className: "ChannelMain__content" },
                        React.createElement(ChannelPostsHistory, { postReactions: postReactions, scrollCache: scrollCache, channel: channel, routeCmid: postsHistoryCmid, hidePlayerOnMusicPlayback: hidePlayerOnMusicPlayback, onPostForward: handlePostForward, onClose: handleClose, onPinChannel: handlePinChannel, onAdultBadgeClick: handleShowAdultBanner })),
                    screenRoute.kind === 'ChannelRoute' &&
                        channel.adminLevel >= 2 /* Peer.GroupAdminLevel.Editor */ &&
                        screenRoute.postponed && (React.createElement("div", { className: "ChannelMain__content" },
                        React.createElement(ChannelPostponedHistory, { postReactions: postReactions, scrollCache: scrollPostponedCache, channel: channel, hidePlayerOnMusicPlayback: hidePlayerOnMusicPlayback, routeCmid: screenRoute.postponed !== true
                                ? screenRoute.postponed
                                : postsHistoryCmid, onClose: handleClose }))),
                    isChannelPostCommentsVisible && (React.createElement(StickerEmojiMenuProvider, { value: stickerEmojiMenu },
                        React.createElement("div", { className: "ChannelMain__content" },
                            React.createElement(ChannelPostComments, { postReactions: postReactions, onForward: handlePostForward, channel: channel, postCmid: postCmid, highlightId: highlightId, isSending: commentsSendLocks.has(`${channel.id}-${postCmid}`), handleForward: handleCommentForward, handleHighlightComment: handleHighlightComment, hidePlayerOnMusicPlayback: hidePlayerOnMusicPlayback })))))),
            forwardModal.isActive && (React.createElement(ForwardModal, { entrypoint: "channel", initialStrategy: "multiple", canChooseStrategy: false, withChannelsTab: !channel.isClosed && !isForwardFromNewChannel, forward: forward, currentPeerId: Peer.resolveId(channel.id), close: handleCancelForward, openChannel: openChannel, openConvo: openConvo })),
            pinChannelErrorModal.isActive && (React.createElement(ModalDialog, { title: lang.use('me_error_title'), content: lang.use('me_too_many_channels_pinned_error'), closeLabel: lang.use('me_close'), onClose: pinChannelErrorModal.close, buttons: React.createElement(Button, { onClick: pinChannelErrorModal.close }, lang.use('me_close')) })),
            activeModal && (React.createElement(ChannelModerationModals, { activeModal: activeModal, channelId: channel.id, onClose: () => setActiveModal(null) })),
            !vkm_channels_onboarding_folder &&
                channelFirstEntryModal.isActive && (React.createElement(ChannelFirstEntryModal, { handleModalClose: onCloseChannelFirstEntryModal })))));
});
//# sourceMappingURL=ChannelMain.js.map