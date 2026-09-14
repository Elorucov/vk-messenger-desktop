import './VideoPlayerChat.css';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useState, } from 'react';
import cx from 'classnames';
import { Icon20Dropdown, Icon56CommentOutline } from '@vkontakte/icons';
import * as VideoConvo from '../../../core/model/VideoConvo';
import { isDepsShallowEqual, useBrowserEnv, useDispatch, useMemoWithCustomCompare, useVideoConvos, useFeatureFlags, } from '../../hooks/misc';
import { VirtualizerCore, } from '../../ui/VirtualScroll/VirtualizerCore';
import { VIDEO_COMMENTS_PER_PAGE } from '../../../core/config/config';
import { useVirtualScroll } from '../../ui/VirtualScroll/useVirtualScroll';
import { OptimizedSpinner } from '../../ui/OptimizedSpinner/OptimizedSpinner';
import { VirtualScrollList } from '../../ui/VirtualScroll/VirtualScrollList';
import { ScrollbarProvider } from '@vkontakte-internal/scrollbar';
import { VideoComment } from '../../ui/VideoComment/VideoComment';
import { VirtualScrollItem } from '../../ui/VirtualScroll/VirtualScrollItem';
import { VideoCommentsComposer } from '../../ui/VideoCommentsComposer/VideoCommentsComposer';
import { ImagesLayoutProvider } from '../../ui/ConvoHistory/ImagesLayoutContext';
import { ColorSchemeProvider, Placeholder } from '@vkontakte/vkui';
import { useScrollIndent } from '../../hooks/useScrollIndent';
import { HopNavigationButton } from '../../ui/HopNavigationButton/HopNavigationButton';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { StickersPopupRootContainer } from '../../ui/StickersPopupRootContainer/StickersPopupRootContainer';
import { PopupAnimationDeductibleElementWrapper } from '../../ui/PopupAnimationDeductibleElementWrapper/PopupAnimationDeductibleElementWrapper';
import { useStickerEmojiMenuPopper } from '../../ui/StickerEmojiMenu/StickerEmojiMenu';
import { StickerEmojiMenuProvider } from '../../ui/StickerEmojiMenu/StickerEmojiMenuContext';
const VIRTUALIZER_CONFIG = {
    sliceCount: VIDEO_COMMENTS_PER_PAGE,
    preloadCount: VIDEO_COMMENTS_PER_PAGE / 10,
    throttleDelay: 100,
    sliceCountIncrement: 1.5,
    sliceByViewAreaRatio: 2.5,
};
const PIN_BOTTOM_OFFSET = 100;
const getCommentKey = (cmid) => {
    return `comment_${cmid}`;
};
export const VideoPlayerChat = memo(({ video, className, isChatShown }) => {
    const featureFlags = useFeatureFlags();
    const dispatch = useDispatch();
    const videoConvos = useVideoConvos();
    const $historyControlRef = React.useRef();
    const stickerEmojiMenu = useStickerEmojiMenuPopper();
    useEffect(() => {
        dispatch({
            type: 'UserOpenedVideoChat',
            video,
        });
        return () => {
            dispatch({
                type: 'UserClosedVideoChat',
                video,
            });
        };
        // Делаем реинициализацию только при изменении video.id
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [video.id]);
    const videoConvo = videoConvos.get(VideoConvo.resolveId(video.id));
    const isInitialLoading = !videoConvo;
    if (!VideoConvo.canShowPlayer(videoConvos, video)) {
        return null;
    }
    const POPUP_STICKER_ANIMATION_CONTAINER_ID = 'popup-sticker-video-comments-container';
    const isPopupStickerAnimationDisabled = !featureFlags.vas_popup_stickers_in_comments;
    return (React.createElement(ColorSchemeProvider, { value: "dark" },
        React.createElement(StickersPopupRootContainer, { id: POPUP_STICKER_ANIMATION_CONTAINER_ID, isUseAsFullscreen: true, className: cx(className, 'VideoPlayerChat', {
                VideoPlayerChat__hidden: !isChatShown,
            }), disabled: isPopupStickerAnimationDisabled }, isInitialLoading ? (React.createElement(OptimizedSpinner, { className: "PostCommentsHistory__fullSpinner", size: "m" })) : (React.createElement(React.Fragment, null,
            React.createElement(StickerEmojiMenuProvider, { value: stickerEmojiMenu },
                React.createElement(VideoCommentsHistory, { ref: $historyControlRef, videoConvo: videoConvo, withPlaceholder: videoConvo.canComment }),
                React.createElement(PopupAnimationDeductibleElementWrapper, { className: "VideoPlayerChat__composer", popupStickerContainerId: POPUP_STICKER_ANIMATION_CONTAINER_ID, disabled: isPopupStickerAnimationDisabled },
                    React.createElement(VideoCommentsComposer, { videoId: videoConvo.id, onSent: $historyControlRef.current?.scrollBottom, isRestricted: !videoConvo.canComment }))))))));
});
VideoPlayerChat.displayName = 'VideoPlayerChat';
const getCommentsPlaceholder = (lang, videoType) => {
    switch (videoType) {
        case 'live':
            return lang.use('me_video_comment_no_comments');
        case 'interactive':
        case 'movie':
        case 'music_video':
        case 'video':
        case 'video_message':
        case 'tv_channel':
        case 'story':
        case undefined:
            return lang.use('me_video_comment_no_comments_video');
        case 'short_video':
            return lang.use('me_video_comment_no_comments_short_video');
        default:
            exhaustivenessCheck(videoType);
    }
};
const VideoCommentsHistory = memo(forwardRef(({ videoConvo, withPlaceholder }, ref) => {
    const { comments, hasMore, id: videoId, ownerId } = videoConvo;
    const [wrapper, setWrapper] = useState(null);
    const [content, setContent] = useState(null);
    const [virtualizerCore] = useState(() => new VirtualizerCore(VIRTUALIZER_CONFIG));
    const dispatch = useDispatch();
    const { lang } = useBrowserEnv();
    const handleAreaChange = (viewArea) => {
        const lastComment = comments[0];
        if (lastComment &&
            viewArea &&
            viewArea.upperIndex <= VIRTUALIZER_CONFIG.preloadCount &&
            hasMore) {
            dispatch({
                type: 'MoreVideoCommentsNeeded',
                videoId,
                startCommentId: lastComment.cmid,
            });
        }
    };
    const [isPinnedBottomCrossed, setPinnedBottomCrossed] = useState(true);
    const [scrollPosition, setScrollPosition] = useState({
        kind: 'Bottom',
    });
    useEffect(() => {
        if (isPinnedBottomCrossed) {
            setScrollPosition({
                kind: 'Bottom',
            });
        }
    }, [isPinnedBottomCrossed, comments]);
    const itemsKeys = useMemoWithCustomCompare(() => [...comments.map((comment) => getCommentKey(comment.cmid))], [comments], isDepsShallowEqual);
    const { virtualizerState } = useVirtualScroll({
        virtualizerCore,
        wrapper,
        content,
        options: {
            scrollPosition,
            itemsKeys,
            onViewAreaChange: handleAreaChange,
            anchorAlign: 'bottom',
        },
    });
    const { setTrigger: setPinnedBottomTrigger } = useScrollIndent({
        wrapper,
        margin: PIN_BOTTOM_OFFSET,
        onTriggerCross: useCallback((isCrossed) => {
            setPinnedBottomCrossed(isCrossed);
            virtualizerCore.onPinBottomChanged(isCrossed);
            if (isCrossed) {
                setScrollPosition({
                    kind: 'Bottom',
                });
            }
        }, [virtualizerCore]),
    });
    const scrollableProps = useMemo(() => ({ ref: setWrapper }), []);
    const contentProps = useMemo(() => ({
        className: 'ConvoList__scrollbar-content',
    }), []);
    const scrollBottom = useCallback(() => {
        setScrollPosition({
            kind: 'Bottom',
        });
    }, []);
    useImperativeHandle(ref, () => ({
        scrollBottom,
    }), [scrollBottom]);
    const slice = virtualizerCore.getSliceArea();
    return (React.createElement("div", { className: "VideoPlayerChat__items" },
        comments.length > 0 && !isPinnedBottomCrossed && (React.createElement("div", { className: "VideoPlayerChat__scrollButton" },
            React.createElement(HopNavigationButton, { count: 0, isCounterVisible: false, title: lang.use('me_video_comment_down'), icon: React.createElement(Icon20Dropdown, null), onClick: scrollBottom }))),
        React.createElement(ImagesLayoutProvider, { value: {
                width: 230,
                minHeight: 80,
                preferredRatio: 4 / 3,
                maxSingleHeight: (3 / 4) * 230,
            } },
            React.createElement(ScrollbarProvider, { scrollableProps: scrollableProps, contentProps: contentProps, overflowX: "hidden" },
                React.createElement(VirtualScrollList, { virtualizerCore: virtualizerCore, virtualizerState: virtualizerState },
                    React.createElement("div", { className: "VideoPlayerChat__content", ref: setContent },
                        hasMore && (React.createElement("div", { className: "VideoPlayerChat__spinnerWrapper" },
                            React.createElement(OptimizedSpinner, { size: "s", className: cx('VideoPlayerChat__spinner') }))),
                        withPlaceholder && comments.length === 0 ? (React.createElement(Placeholder, { stretched: true, icon: React.createElement(Icon56CommentOutline, null) }, getCommentsPlaceholder(lang, videoConvo.type))) : (React.createElement(React.Fragment, null,
                            comments?.map((comment) => (React.createElement(VirtualScrollItem, { key: getCommentKey(comment.cmid), itemKey: getCommentKey(comment.cmid) },
                                React.createElement(VideoComment, { comment: comment, videoId: videoId, sourceOwnerId: ownerId })))),
                            slice && slice.bottomIndex >= comments.length - 1 && (React.createElement("div", { key: "pinned-bottom-trigger", ref: setPinnedBottomTrigger }))))))))));
}));
//# sourceMappingURL=VideoPlayerChat.js.map