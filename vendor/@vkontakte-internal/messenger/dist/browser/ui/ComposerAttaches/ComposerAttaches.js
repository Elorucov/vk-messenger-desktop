import '../../ui/ComposerAttaches/ComposerAttaches.css';
import React, { useCallback, useRef } from 'react';
import { HorizontalScroll, } from '../../ui/HorizontalScroll/HorizontalScroll';
import { ComposerAttachPhoto } from '../../ui/ComposerAttachPhoto/ComposerAttachPhoto';
import { ComposerAttachVideo } from '../../ui/ComposerAttachVideo/ComposerAttachVideo';
import { ComposerAttachAudio } from '../../ui/ComposerAttachAudio/ComposerAttachAudio';
import { ComposerAttachDoc } from '../../ui/ComposerAttachDoc/ComposerAttachDoc';
import { ComposerAttachPoll } from '../../ui/ComposerAttachPoll/ComposerAttachPoll';
import { ComposerAttachArtist } from '../../ui/ComposerAttachArtist/ComposerAttachArtist';
import { ComposerAttachAudioPlaylist } from '../../ui/ComposerAttachAudioPlaylist/ComposerAttachAudioPlaylist';
import { Icon12Cancel } from '@vkontakte/icons';
import cx from 'classnames';
import { Loader } from '../../ui/Loader/Loader';
import { ComposerDraggableAttach } from '../../ui/ComposerDraggableAttach/ComposerDraggableAttach';
import { ComposerDraggableList } from '../../ui/ComposerDraggableList/ComposerDraggableList';
import { useBrowserEnv } from '../../hooks/misc';
import { ComposerAttachWall } from '../../ui/ComposerAttachWall/ComposerAttachWall';
import { ComposerAttachWallReply } from '../../ui/ComposerAttachWallReply/ComposerAttachWallReply';
import { ComposerAttachLink } from '../../ui/ComposerAttachLink/ComposerAttachLink';
import { ComposerAttachGeo } from '../../ui/ComposerAttachGeo/ComposerAttachGeo';
import { ComposerAttachCurator } from '../../ui/ComposerAttachCurator/ComposerAttachCurator';
import { ComposerAttachMiniApp } from '../../ui/ComposerAttachMiniApp/ComposerAttachMiniApp';
import { ComposerAttachMarket } from '../../ui/ComposerAttachMarket/ComposerAttachMarket';
import { ComposerAttachStory } from '../../ui/ComposerAttachStory/ComposerAttachStory';
import { ComposerAttachPodcast } from '../../ui/ComposerAttachPodcast/ComposerAttachPodcast';
import { ComposerAttachArticle } from '../../ui/ComposerAttachArticle/ComposerAttachArticle';
import { ComposerAttachDonutLink } from '../../ui/ComposerAttachDonutLink/ComposerAttachDonutLink';
import { ComposerAttachQuestion } from '../../ui/ComposerAttachQuestion/ComposerAttachQuestion';
import { ComposerAttachStickerPack } from '../../ui/ComposerAttachStickerPack/ComposerAttachStickerPack';
import { ComposerAttachEvent } from '../../ui/ComposerAttachEvent/ComposerAttachEvent';
import { ComposerAttachNarrative } from '../../ui/ComposerAttachNarrative/ComposerAttachNarrative';
import { ComposerAttachMarketAlbum } from '../../ui/ComposerAttachMarketAlbum/ComposerAttachMarketAlbum';
import { ComposerAttachAlbum } from '../../ui/ComposerAttachAlbum/ComposerAttachAlbum';
import { ComposerAttachChannelMessage } from '../../ui/ComposerAttachChannelMessage/ComposerAttachChannelMessage';
const ListItem = ({ attach, handleRemove, children, type, index, withRearrangement, }) => {
    const onRemoveAttach = useCallback(() => {
        if (index !== undefined) {
            handleRemove(attach, index);
        }
        else {
            handleRemove?.(attach);
        }
    }, [handleRemove, attach, index]);
    const item = (React.createElement(React.Fragment, null,
        children,
        handleRemove && (React.createElement("button", { type: "button", onClick: onRemoveAttach, className: "ComposerAttaches__remove" },
            React.createElement(Icon12Cancel, null)))));
    /**
     * Для FC без перетаскивания
     */
    return withRearrangement ? (React.createElement(ComposerDraggableAttach, { type: type, index: index, className: "ComposerAttaches__item" }, item)) : type ? (React.createElement("li", { "data-item-type": type, className: "ComposerAttaches__item" }, item)) : (React.createElement("li", { className: "ComposerAttaches__item" }, item));
};
const LoadingListItem = ({ children, attach, }) => {
    const { uploader } = useBrowserEnv();
    return (React.createElement("li", { className: "ComposerAttaches__item ComposerAttaches__itemLoading" },
        children,
        React.createElement("div", { className: "ComposerAttaches__loader" },
            React.createElement(Loader, { alwaysShowLoader: true, progress: (attach.loaded / attach.total) * 100, onCancel: () => uploader.abortUpload(attach.id), onRetry: () => uploader.retryUpload(attach.id), isError: attach.error })),
        attach.error && (React.createElement("button", { onClick: () => uploader.abortUpload(attach.id), className: "ComposerAttaches__remove" },
            React.createElement(Icon12Cancel, null)))));
};
export const ComposerAttaches = ({ attaches, optimistAttaches = {}, rearrangeAttachments, onRemove, className, isCompactView, source, }) => {
    const $horizontalScroll = useRef(null);
    const containerRef = useRef(null);
    const scrollStep = isCompactView ? 140 : 200;
    /**
     * Функция для скролла с помощью аттачей (при перетаскивании)
     */
    const handleAttachScroll = useCallback((side) => {
        if (!$horizontalScroll.current) {
            return;
        }
        $horizontalScroll.current.scrollTo(side === 'left' ? -1 * scrollStep : scrollStep);
    }, [scrollStep]);
    const attachesList = [];
    if (attaches.photos) {
        attaches.photos.forEach((photo, idx) => attachesList.push(React.createElement(ListItem, { key: `${photo.kind}${photo.id}${idx}`, handleRemove: onRemove, attach: photo, index: idx, type: "photos", withRearrangement: !isCompactView },
            React.createElement(ComposerAttachPhoto, { photo: photo, source: source, isCompactView: isCompactView }))));
    }
    if (optimistAttaches.photos) {
        optimistAttaches.photos.forEach((photo) => attachesList.push(React.createElement(LoadingListItem, { key: `${photo.kind}${photo.id}`, attach: photo },
            React.createElement(ComposerAttachPhoto, { photo: photo, source: source }))));
    }
    if (attaches.videos) {
        attaches.videos.forEach((video, idx) => attachesList.push(React.createElement(ListItem, { key: `${video.kind}${video.id}${idx}`, handleRemove: onRemove, attach: video, type: "videos", index: idx, withRearrangement: !isCompactView },
            React.createElement(ComposerAttachVideo, { video: video, source: source, isCompactView: isCompactView }))));
    }
    if (optimistAttaches.videos) {
        optimistAttaches.videos.forEach((video) => attachesList.push(React.createElement(LoadingListItem, { key: `${video.kind}${video.id}`, attach: video },
            React.createElement(ComposerAttachVideo, { video: video, source: source }))));
    }
    if (attaches.docs) {
        attaches.docs.forEach((doc, idx) => attachesList.push(React.createElement(ListItem, { key: `${doc.kind}${doc.id}${idx}`, handleRemove: onRemove, attach: doc, type: "docs", index: idx, withRearrangement: !isCompactView },
            React.createElement(ComposerAttachDoc, { doc: doc, source: source, isCompactView: isCompactView }))));
    }
    if (optimistAttaches.docs) {
        optimistAttaches.docs.forEach((doc) => attachesList.push(React.createElement(LoadingListItem, { key: `${doc.kind}${doc.id}`, attach: doc },
            React.createElement(ComposerAttachDoc, { isCompactView: isCompactView, doc: doc, source: source }))));
    }
    if (attaches.audios) {
        attaches.audios.forEach((audio, idx) => attachesList.push(React.createElement(ListItem, { key: `${audio.kind}${audio.id}${idx}`, handleRemove: onRemove, attach: audio, type: "audios", index: idx, withRearrangement: !isCompactView },
            React.createElement(ComposerAttachAudio, { audio: audio, isCompactView: isCompactView }))));
    }
    if (optimistAttaches.audios) {
        optimistAttaches.audios.forEach((audio) => attachesList.push(React.createElement(LoadingListItem, { key: `${audio.kind}${audio.id}`, attach: audio },
            React.createElement(ComposerAttachAudio, { audio: audio, isCompactView: isCompactView }))));
    }
    if (attaches.audioPlaylists) {
        attaches.audioPlaylists.forEach((playlist, idx) => attachesList.push(React.createElement(ListItem, { key: `${playlist.kind}${playlist.id}${idx}`, handleRemove: onRemove, attach: playlist, type: "audioPlaylists", index: idx, withRearrangement: !isCompactView },
            React.createElement(ComposerAttachAudioPlaylist, { playList: playlist, isCompactView: isCompactView }))));
    }
    if (attaches.narratives) {
        attaches.narratives.forEach((narrative, idx) => attachesList.push(React.createElement(ListItem, { key: `${narrative.kind}${narrative.id}`, handleRemove: onRemove, attach: narrative, type: "narratives", index: idx, withRearrangement: !isCompactView },
            React.createElement(ComposerAttachNarrative, { narrative: narrative, isCompactView: isCompactView }))));
    }
    if (attaches.artist) {
        attachesList.push(React.createElement(ListItem, { attach: attaches.artist, handleRemove: onRemove },
            React.createElement(ComposerAttachArtist, { artist: attaches.artist, isCompactView: isCompactView })));
    }
    if (attaches.event) {
        attachesList.push(React.createElement(ListItem, { attach: attaches.event, handleRemove: onRemove },
            React.createElement(ComposerAttachEvent, { event: attaches.event, isCompactView: isCompactView })));
    }
    if (attaches.podcast) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.podcast.kind}${attaches.podcast.id}`, handleRemove: onRemove, attach: attaches.podcast },
            React.createElement(ComposerAttachPodcast, { podcast: attaches.podcast, isCompactView: isCompactView })));
    }
    if (attaches.poll) {
        attachesList.push(React.createElement(ListItem, { attach: attaches.poll, handleRemove: onRemove },
            React.createElement(ComposerAttachPoll, { poll: attaches.poll, source: source })));
    }
    if (attaches.story) {
        attachesList.push(React.createElement(ListItem, { attach: attaches.story, handleRemove: onRemove },
            React.createElement(ComposerAttachStory, { isCompactView: isCompactView })));
    }
    if (attaches.wall) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.wall.kind}${attaches.wall.id}`, handleRemove: onRemove, attach: attaches.wall, type: "wall" },
            React.createElement(ComposerAttachWall, { wall: attaches.wall, isCompactView: isCompactView })));
    }
    if (attaches.channelMessage && attaches.channelMessage.channelId) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.channelMessage.kind}${attaches.channelMessage.cmid}`, handleRemove: onRemove, attach: attaches.channelMessage, type: "channelMessage" },
            React.createElement(ComposerAttachChannelMessage, { channelId: attaches.channelMessage.channelId, isCompactView: isCompactView })));
    }
    if (attaches.wallReply) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.wallReply.kind}${attaches.wallReply.id}`, handleRemove: onRemove, attach: attaches.wallReply },
            React.createElement(ComposerAttachWallReply, { wallReply: attaches.wallReply, isCompactView: isCompactView })));
    }
    if (attaches.article) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.article.kind}${attaches.article.url}`, handleRemove: onRemove, attach: attaches.article },
            React.createElement(ComposerAttachArticle, { article: attaches.article, isCompactView: isCompactView })));
    }
    if (attaches.curator) {
        attaches.curator.forEach((curator) => {
            attachesList.push(React.createElement(ListItem, { key: `${curator.kind}${curator.id}`, handleRemove: onRemove, attach: curator },
                React.createElement(ComposerAttachCurator, { attach: curator, isCompactView: isCompactView })));
        });
    }
    if (attaches.stickerPack) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.stickerPack.kind}${attaches.stickerPack.url}`, handleRemove: onRemove, attach: attaches.stickerPack },
            React.createElement(ComposerAttachStickerPack, { attach: attaches.stickerPack, isCompactView: isCompactView })));
    }
    if (attaches.link) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.link.kind}${attaches.link.title}`, handleRemove: onRemove, attach: attaches.link },
            React.createElement(ComposerAttachLink, { link: attaches.link, isCompactView: isCompactView })));
    }
    if (attaches.inviteLink) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.inviteLink.kind}${attaches.inviteLink.title}`, handleRemove: onRemove, attach: attaches.inviteLink },
            React.createElement(ComposerAttachLink, { link: attaches.inviteLink, isCompactView: isCompactView })));
    }
    if (attaches.geo) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.geo.kind}`, handleRemove: onRemove, attach: attaches.geo },
            React.createElement(ComposerAttachGeo, { geo: attaches.geo })));
    }
    if (attaches.miniApps) {
        attaches.miniApps.forEach((miniApp) => attachesList.push(React.createElement(ListItem, { key: `${miniApp.kind}${miniApp.id}`, handleRemove: onRemove, attach: miniApp },
            React.createElement(ComposerAttachMiniApp, { miniApp: miniApp, isCompactView: isCompactView }))));
    }
    if (attaches.market) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.market.kind}`, handleRemove: onRemove, attach: attaches.market },
            React.createElement(ComposerAttachMarket, { market: attaches.market, isCompactView: isCompactView })));
    }
    if (attaches.marketAlbum) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.marketAlbum.kind}`, handleRemove: onRemove, attach: attaches.marketAlbum },
            React.createElement(ComposerAttachMarketAlbum, { marketAlbum: attaches.marketAlbum, isCompactView: isCompactView })));
    }
    if (attaches.donutLink) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.donutLink.kind}`, handleRemove: onRemove, attach: attaches.donutLink },
            React.createElement(ComposerAttachDonutLink, { donutLink: attaches.donutLink, isCompactView: isCompactView })));
    }
    if (attaches.album) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.album.kind}`, handleRemove: onRemove, attach: attaches.album },
            React.createElement(ComposerAttachAlbum, { album: attaches.album, isCompactView: isCompactView })));
    }
    if (attaches.question) {
        attachesList.push(React.createElement(ListItem, { key: `${attaches.question.kind}`, attach: attaches.question },
            React.createElement(ComposerAttachQuestion, { isCompactView: isCompactView, question: attaches.question.question })));
    }
    if (attachesList.length === 0) {
        return null;
    }
    return (React.createElement("div", { ref: containerRef, className: cx('ComposerAttaches', className) },
        React.createElement(HorizontalScroll, { ref: $horizontalScroll, arrowSize: "s", showArrows: true, showBorders: !isCompactView, arrowScrollStep: scrollStep },
            React.createElement(ComposerDraggableList, { parentContainerRef: containerRef, onPositionChange: rearrangeAttachments, className: "ComposerAttaches__list", doScroll: handleAttachScroll }, attachesList))));
};
//# sourceMappingURL=ComposerAttaches.js.map