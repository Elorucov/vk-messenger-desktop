import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import '../../ui/VideoComment/VideoComment.css';
import React from 'react';
import { Avatar } from '../../ui/Avatar/Avatar';
import * as Peer from '../../../core/model/Peer';
import * as Attach from '../../../core/model/Attach';
import { PeerTitle } from '../../ui/PeerTitle/PeerTitle';
import { AttachPhotosVideos } from '../../ui/AttachPhotosVideos/AttachPhotosVideos';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachMarket } from '../../ui/AttachMarket/AttachMarket';
import { AttachGraffiti } from '../../ui/AttachGraffiti/AttachGraffiti';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { MessageText } from '../../ui/MessageText/MessageText';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Link } from '../../ui/Link/Link';
import { AttachAudioPlaylist } from '../../ui/AttachAudioPlaylist/AttachAudioPlaylist';
import { AttachArtist } from '../../ui/AttachArtist/AttachArtist';
import { AttachCurator } from '../../ui/AttachCurator/AttachCurator';
import { VideoCommentDropdown } from '../../ui/VideoCommentDropdown/VideoCommentDropdown';
import { ClampText, ClampTextTrigger } from '../../ui/ClampText/ClampText';
const attachProps = {
    isInBubble: false,
    isOut: false,
};
export const VideoComment = ({ comment, videoId, sourceOwnerId, }) => {
    const peers = usePeers();
    const { id: ownerId } = useOwner();
    const { lang } = useBrowserEnv();
    let upperInfo = null;
    let content = null;
    let actions = null;
    let avatar = null;
    let isTriggerShown = true;
    switch (comment.kind) {
        case 'Normal': {
            const peer = Peer.safeGet(peers, comment.peerId);
            const attaches = comment.attaches;
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
            avatar = (React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: peer.id,
                    screenName: Peer.screenName(peer),
                }, className: "VideoComment__peerLink", "aria-hidden": true, tabIndex: -1 },
                React.createElement(Avatar, { size: 24, peer: peer })));
            actions = (React.createElement(VideoCommentDropdown, { className: "VideoComment__upperActions", comment: comment, canDelete: comment.canDelete, canReport: peer.id !== ownerId, videoId: videoId, sourceOwnerId: sourceOwnerId }));
            upperInfo = (React.createElement(Link, { to: {
                    kind: 'PeerPanel',
                    peerId: peer.id,
                    screenName: Peer.screenName(peer),
                }, className: "VideoComment__peerLink" },
                React.createElement(PeerTitle, { className: "VideoComment__title", peer: peer })));
            if (hasAttaches && comment.chunks.length === 0) {
                isTriggerShown = false;
            }
            content = (React.createElement(React.Fragment, null,
                comment.chunks && (React.createElement(MessageText, { className: "VideoComment__message", chunks: comment.chunks, allowMentionHighlighting: true })),
                hasAttaches && (React.createElement("div", { className: "VideoComment__attachments" },
                    Attach.hasMediaAttaches(attaches) && (React.createElement(AttachPhotosVideos, { attaches: attaches, isForwarded: false, isInChannel: false, ...attachProps })),
                    attaches.curator &&
                        attaches.curator.map((c) => (React.createElement(AttachCurator, { key: `${c.kind}${c.id}`, attach: c, ...attachProps }))),
                    attaches.link && (React.createElement(AttachLink, { link: attaches.link, ...attachProps })),
                    attaches.docs &&
                        attaches.docs
                            /**
                             * "медиа" файлы (те, что имеют превью) отрисует AttachPhotosVideos
                             */
                            .filter((doc) => !Attach.preview(doc))
                            .map((doc) => (React.createElement(AttachDoc, { key: doc.id, doc: doc, ...attachProps }))),
                    attaches.audios &&
                        attaches.audios.map((audio) => (React.createElement(AttachAudio, { audio: audio, key: audio.id, ...attachProps }))),
                    attaches.audioPlaylists &&
                        attaches.audioPlaylists.map((playlist) => (React.createElement(AttachAudioPlaylist, { playlist: playlist, key: playlist.id, ...attachProps }))),
                    attaches.artist && (React.createElement(AttachArtist, { artist: attaches.artist, ...attachProps })),
                    attaches.market && (React.createElement(AttachMarket, { market: attaches.market, ...attachProps })),
                    attaches.graffiti && (React.createElement(AttachGraffiti, { graffiti: attaches.graffiti, ...attachProps })),
                    attaches.sticker && (React.createElement("div", null,
                        React.createElement(AttachSticker, { size: 128, sticker: attaches.sticker, commentId: comment.cmid, commentPeerId: comment.peerId, iconPosition: "rightRelative" })))))));
            break;
        }
        case 'MarkedDeleted':
        case 'Deleted': {
            upperInfo = (React.createElement("span", { className: "VideoComment__message--deleted" }, lang.use('me_video_comment_deleted')));
            break;
        }
        default:
            exhaustivenessCheck(comment);
    }
    const renderContent = () => {
        const commentContent = (React.createElement("div", { className: "VideoComment__content" },
            upperInfo,
            content));
        if (isTriggerShown) {
            return (React.createElement(ClampText, { initialTriggerVisibility: false, trigger: React.createElement(ClampTextTrigger, { className: "VideoComment__showMore" }, lang.use('me_video_comment_show_more')), lines: 5 }, commentContent));
        }
        return commentContent;
    };
    return (React.createElement("div", { className: "VideoComment" },
        avatar,
        renderContent(),
        actions));
};
//# sourceMappingURL=VideoComment.js.map