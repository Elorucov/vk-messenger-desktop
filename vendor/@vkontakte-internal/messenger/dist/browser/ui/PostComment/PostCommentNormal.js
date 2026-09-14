import { Icon16MoreHorizontal } from '@vkontakte/icons';
import { useBrowserEnv, useFeatureFlags, usePeers, usePeer, useViewer, } from '../../hooks/misc';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { AttachArtist } from '../../ui/AttachArtist/AttachArtist';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachAudioPlaylist } from '../../ui/AttachAudioPlaylist/AttachAudioPlaylist';
import { AttachCurator } from '../../ui/AttachCurator/AttachCurator';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { AttachGraffiti } from '../../ui/AttachGraffiti/AttachGraffiti';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachMarket } from '../../ui/AttachMarket/AttachMarket';
import { AttachPhotosVideos } from '../../ui/AttachPhotosVideos/AttachPhotosVideos';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { ClampText, ClampTextTrigger } from '../../ui/ClampText/ClampText';
import { MessageText } from '../../ui/MessageText/MessageText';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { PostCommentAvatar, PostCommentLayout, PostCommentLikePanel, } from '../../ui/PostComment/PostComment';
import { PostCommentActionsMenuDropdown, } from '../../ui/PostCommentActionsMenu/PostCommentActionsMenu';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import * as Viewer from '../../../core/model/Viewer';
import React, { useCallback, useEffect, useMemo, useRef, } from 'react';
import '../../ui/PostComment/PostCommentNormal.css';
import { Link } from '../../ui/Link/Link';
import { FormattedDate } from '../../ui/Time/Time';
import { Footnote } from '@vkontakte/vkui';
const ATTACH_DEFAULT_PROPS = {
    isInBubble: true,
    isOut: false,
};
export const PostCommentNormal = ({ className, comment, isCompact, clampTextLines, getIsActionAvailable, onAction, onLoadMoreLikePeers, onLikeModalOpen, onReplyLabelClick, hideFirstReplyLabel, ...props }) => {
    const { isMobileLayout } = useLayoutData();
    const { profileType } = useViewer();
    const { lang } = useBrowserEnv();
    const peers = usePeers();
    const { vkm_channel_comments_reply, vkm_channel_comments_reactions } = useFeatureFlags();
    const replyToUser = vkm_channel_comments_reply &&
        comment.replyToUser &&
        Peer.safeGet(peers, comment.replyToUser);
    const $likePanel = useRef(null);
    const isEdu = Viewer.isEdu(profileType);
    const commentRef = useRef(null);
    const toggleContextMenuRef = useRef();
    const onContextMenu = useCallback((e) => {
        if (isMobileLayout) {
            e.preventDefault();
            return;
        }
        toggleContextMenuRef.current?.({
            preventDefault: e.preventDefault.bind(e),
            x: e.clientX,
            y: e.clientY,
        });
    }, [isMobileLayout]);
    const handleReplyLabelClick = useCallback(() => {
        if (comment.replyToComment) {
            onReplyLabelClick?.(comment.replyToComment);
        }
    }, [onReplyLabelClick, comment]);
    const author = usePeer(comment.peerId, true);
    const isLiked = comment.likes.reactionId !== undefined;
    const likesCount = comment.likes.count;
    const likedPeerIds = useMemo(() => {
        return [...comment.likes.peerIds];
    }, [comment.likes.peerIds]);
    useEffect(() => {
        const elem = $likePanel.current;
        if (!elem || likesCount === 0 || likedPeerIds.length !== 0) {
            return;
        }
        const handleHover = () => onLoadMoreLikePeers?.();
        elem.addEventListener('mouseenter', handleHover, { once: true });
        return () => {
            elem.removeEventListener('mouseenter', handleHover);
        };
    }, [likesCount, onLoadMoreLikePeers, likedPeerIds.length]);
    const getReplyName = (peer, author) => {
        if (!peer) {
            return '';
        }
        let replyName = '';
        switch (peer.kind) {
            case 'User':
                replyName = lang.use('me_post_comment_reply_label', {
                    values: {
                        to: peer.firstNameDat,
                    },
                    sex: 'sex' in author ? author.sex : 'male',
                });
                break;
            case 'Group':
                replyName = lang.use('me_post_comment_reply_label', {
                    values: {
                        to: peer.name,
                    },
                    sex: 'sex' in author ? author.sex : 'male',
                });
                break;
            case 'Chat':
            case 'Contact':
            default:
                break;
        }
        return replyName;
    };
    const isCommentEdited = comment.updatedAt;
    return (React.createElement(PostCommentLayout, { ref: commentRef, className: className, avatar: React.createElement(PostCommentAvatar, { peer: author, isCompact: isCompact }), onContextMenu: onContextMenu, ...props },
        React.createElement("div", { className: "PostCommentNormal__header" },
            React.createElement("div", { className: "PostCommentNormal__headerStart" },
                React.createElement(Link, { to: {
                        kind: 'PeerPanel',
                        peerId: author.id,
                        screenName: Peer.screenName(author),
                    }, className: "PostCommentNormal__peerTitle" },
                    React.createElement(PeerTitle, { peer: author })),
                !!replyToUser && !hideFirstReplyLabel && (React.createElement(Footnote, { role: "button", onClick: handleReplyLabelClick, className: "PostCommentNormal__replyLabel" }, getReplyName(replyToUser, author)))),
            React.createElement(PostCommentActionsMenuDropdown, { classNames: { wrapper: 'PostCommentActionsMenuDropdown' }, getToggleOpen: (toggleOpen) => {
                    toggleContextMenuRef.current = toggleOpen;
                }, getIsActionAvailable: getIsActionAvailable, onAction: onAction },
                React.createElement("button", { className: "PostComment__button PostComment__button--hidden", "aria-label": lang.use('me_post_comment_action_button') },
                    React.createElement(Icon16MoreHorizontal, null)))),
        React.createElement(PostCommentNormalContent, { chunks: comment.chunks, attaches: comment.attaches, channelId: comment.channelId, postCmid: comment.postCmid, commentCmid: comment.cmid, clampTextLines: clampTextLines, commentPeerId: comment.peerId }),
        React.createElement("div", { className: "PostCommentNormal__footer" },
            React.createElement("div", { className: "PostCommentNormal__footerStart" },
                React.createElement("span", { className: "PostCommentNormal__time" },
                    React.createElement(FormattedDate, { timestamp: comment.sentAt, shortMonths: true, variant: "time-ago" }),
                    isCommentEdited && (React.createElement("span", null,
                        " \u00B7 ",
                        lang.use('me_post_comment_edited_label_short')))),
                vkm_channel_comments_reply && getIsActionAvailable('reply') && (React.createElement("button", { className: "PostCommentNormal__replyButton", "aria-label": lang.use('me_post_comment_reply_button_text'), onClick: () => onAction?.('reply') }, lang.use('me_post_comment_reply_button_text')))),
            !isEdu && vkm_channel_comments_reactions && (React.createElement(PostCommentLikePanel, { ref: $likePanel, isLiked: isLiked, likesCount: likesCount, likedPeerIds: likedPeerIds, onClick: () => onAction?.('like'), onMenuClick: onLikeModalOpen })))));
};
const PostCommentNormalContent = ({ chunks, attaches, channelId, postCmid, commentCmid, clampTextLines, commentPeerId, }) => {
    const { lang } = useBrowserEnv();
    const hasAttaches = attaches.photos ||
        attaches.audios ||
        attaches.audioPlaylists ||
        attaches.artist ||
        attaches.videos ||
        attaches.docs ||
        attaches.link ||
        attaches.sticker ||
        attaches.market ||
        attaches.marketAlbum ||
        attaches.graffiti ||
        attaches.curator;
    const hasMediaAttaches = attaches.videos || attaches.photos || Attach.docsWithPreview(attaches.docs);
    const audioSource = useMemo(() => ({
        kind: 'comment',
        commentCmid,
        channelId,
        postCmid,
    }), [channelId, commentCmid, postCmid]);
    const renderTextChunks = () => {
        if (chunks.length === 0) {
            return;
        }
        const renderedChunks = (React.createElement(MessageText, { className: "PostCommentNormal__messageText", chunks: chunks, allowMentionHighlighting: true }));
        if (clampTextLines !== undefined) {
            return (React.createElement(ClampText, { className: "PostCommentNormal__clampText", lines: clampTextLines, trigger: React.createElement("div", { className: "PostCommentNormal__clampTriggerWrapper" },
                    React.createElement(ClampTextTrigger, { className: "PostCommentNormal__clampTrigger" }, lang.use('me_convo_profile_information_show_more'))) }, renderedChunks));
        }
        return renderedChunks;
    };
    return (React.createElement("div", { className: "PostCommentNormal__content" },
        renderTextChunks(),
        hasAttaches && (React.createElement("div", { className: "PostCommentNormal__contentAttaches" },
            hasMediaAttaches && (React.createElement(AttachPhotosVideos, { attaches: attaches, isForwarded: false, isInChannel: true, ...ATTACH_DEFAULT_PROPS })),
            attaches.curator &&
                attaches.curator.map((curator) => (React.createElement(AttachCurator, { key: `${curator.kind}${curator.id}`, attach: curator, ...ATTACH_DEFAULT_PROPS }))),
            attaches.link && (React.createElement(AttachLink, { link: attaches.link, ...ATTACH_DEFAULT_PROPS })),
            Attach.docsWithoutPreview(attaches.docs)?.map((doc) => (React.createElement(AttachDoc, { className: "PostCommentNormal__attachDocsItem", key: doc.id, doc: doc, ...ATTACH_DEFAULT_PROPS }))),
            attaches.audios &&
                attaches.audios.map((audio) => (React.createElement(AttachAudio, { audio: audio, key: audio.id, source: audioSource, ...ATTACH_DEFAULT_PROPS }))),
            attaches.audioPlaylists &&
                attaches.audioPlaylists.map((playlist) => (React.createElement(AttachAudioPlaylist, { playlist: playlist, key: playlist.id, ...ATTACH_DEFAULT_PROPS }))),
            attaches.artist && (React.createElement(AttachArtist, { artist: attaches.artist, source: audioSource, ...ATTACH_DEFAULT_PROPS })),
            attaches.market && (React.createElement(AttachMarket, { market: attaches.market, ...ATTACH_DEFAULT_PROPS })),
            attaches.graffiti && (React.createElement(AttachGraffiti, { graffiti: attaches.graffiti, ...ATTACH_DEFAULT_PROPS })),
            attaches.sticker && (React.createElement(AttachSticker, { size: 128, sticker: attaches.sticker, commentId: commentCmid, iconPosition: "rightRelative", commentPeerId: commentPeerId, ...ATTACH_DEFAULT_PROPS }))))));
};
//# sourceMappingURL=PostCommentNormal.js.map