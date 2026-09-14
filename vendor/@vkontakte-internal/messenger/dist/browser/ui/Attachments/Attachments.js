import '../../ui/Attachments/Attachments.css';
import '../../ui/Attachments/AttachmentsWithoutBubblesTheme.css';
import React, { useMemo } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Message from '../../../core/model/Message';
import cx from 'classnames';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachMarket } from '../../ui/AttachMarket/AttachMarket';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { AttachVoice } from '../../ui/AttachVoice/AttachVoice';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachPhotosVideos } from '../../ui/AttachPhotosVideos/AttachPhotosVideos';
import { AttachStory } from '../../ui/AttachStory/AttachStory';
import { AttachAudioPlaylist } from '../../ui/AttachAudioPlaylist/AttachAudioPlaylist';
import { AttachAudioPlaylistNew } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistNew';
import { AttachMoneyTransfer } from '../../ui/AttachMoneyTransfer/AttachMoneyTransfer';
import { AttachGeo } from '../../ui/AttachGeo/AttachGeo';
import { AttachMiniApp } from '../../ui/AttachMiniApp/AttachMiniApp';
import { AttachArticle } from '../../ui/AttachArticle/AttachArticle';
import { AttachInviteLink } from '../../ui/AttachInviteLink/AttachInviteLink';
import { AttachDonutLink } from '../../ui/AttachDonutLink/AttachDonutLink';
import { AttachGraffiti } from '../../ui/AttachGraffiti/AttachGraffiti';
import { AttachPoll } from '../../ui/AttachPoll/AttachPoll';
import { AttachWidget } from '../../ui/AttachWidget/AttachWidget';
import { AttachNarrative } from '../../ui/AttachNarrative/AttachNarrative';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { AttachEvent } from '../../ui/AttachEvent/AttachEvent';
import { AttachMoneyRequest } from '../../ui/AttachMoneyRequest/AttachMoneyRequest';
import { AttachMiniAppWidget } from '../../ui/AttachMiniAppWidget/AttachMiniAppWidget';
import { AttachActiveCall } from '../../ui/AttachActiveCall/AttachActiveCall';
import { AttachStickerPack } from '../../ui/AttachStickerPack/AttachStickerPack';
import { AttachFinishedCall } from '../../ui/AttachFinishedCall/AttachFinishedCall';
import { AttachCurator } from '../../ui/AttachCurator/AttachCurator';
import { AttachArtist } from '../../ui/AttachArtist/AttachArtist';
import { AttachWallNew } from '../../ui/AttachWall/AttachWallNew';
import { AttachMarketAlbum } from '../../ui/AttachMarketAlbum/AttachMarketAlbum';
import { AttachPhotoAlbum } from '../../ui/AttachPhotoAlbum/AttachPhotoAlbum';
import { AttachQuestion } from '../../ui/AttachQuestion/AttachQuestion';
import { audioTrackSourceFromMessage } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
import { AttachChannelMessage } from '../../ui/AttachChannelMessage/AttachChannelMessage';
export const Attachments = ({ className, message, peerId, isInBubble, entrypoint, isThemed, autoplay, forwardLevel = 0, isFavorites = false, isCompact = false, isForwarded = false, rootIsOut = false, isInModal = false, isClipOnly, getMediaAttachLinkPayload, totalForwardedMessageCount = 1, onPlayed, onCloseMessageInModal, onWidthChange, withStory, }) => {
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const isOut = rootIsOut || (message.kind !== 'Foreign' ? message.isOut : false);
    const attachProps = {
        isInBubble: isInBubble && !isWithoutBubblesTheme,
        isOut,
    };
    const attachmentsCount = Attach.count(message.attaches);
    const audioSource = useMemo(() => message.kind === 'Normal' || message.kind === 'Foreign'
        ? audioTrackSourceFromMessage(message)
        : undefined, [message]);
    return (React.createElement("div", { className: cx('Attachments', className, isWithoutBubblesTheme && 'Attachments__withoutBubbles'), onClick: (e) => {
            e.stopPropagation();
        }, key: message.updatedAt },
        message.attaches.activeCall && (React.createElement(AttachActiveCall, { activeCall: message.attaches.activeCall, ...attachProps })),
        message.attaches.finishedCall && (React.createElement(AttachFinishedCall, { call: message.attaches.finishedCall, peerId: peerId, ...attachProps })),
        message.attaches.graffiti && (React.createElement(AttachGraffiti, { graffiti: message.attaches.graffiti, isInBubble: isInBubble, forwardLevel: forwardLevel, onWidthChange: onWidthChange })),
        message.attaches.curator &&
            message.attaches.curator.map((c) => (React.createElement(AttachCurator, { attach: c, ...attachProps }))),
        message.attaches.stickerPack && (React.createElement(AttachStickerPack, { isOut: isOut, isInBubble: isInBubble, attach: message.attaches.stickerPack })),
        message.attaches.link && (React.createElement(AttachLink, { link: message.attaches.link, ...attachProps })),
        message.attaches.inviteLink && (React.createElement(AttachInviteLink, { link: message.attaches.inviteLink, ...attachProps })),
        message.attaches.album && (React.createElement(AttachPhotoAlbum, { album: message.attaches.album, ...attachProps })),
        message.attaches.market && (React.createElement(AttachMarket, { market: message.attaches.market, ...attachProps })),
        message.attaches.marketAlbum && (React.createElement(AttachMarketAlbum, { marketAlbum: message.attaches.marketAlbum, ...attachProps })),
        withStory && message.attaches.story && (React.createElement(AttachStory, { story: message.attaches.story, isOut: isOut, isCompact: isCompact, isForwarded: isForwarded, onWidthChange: onWidthChange })),
        message.attaches.geo && (React.createElement(AttachGeo, { geo: message.attaches.geo, onWidthChange: onWidthChange, ...attachProps })),
        message.attaches.event && (React.createElement(AttachEvent, { event: message.attaches.event, ...attachProps })),
        message.attaches.narratives &&
            message.attaches.narratives.map((narrative) => (React.createElement(AttachNarrative, { key: narrative.id, narrative: narrative, ...attachProps }))),
        Attach.docsWithoutPreview(message.attaches.docs)?.map((doc) => (React.createElement(AttachDoc, { key: doc.id, doc: doc, forwardLevel: forwardLevel, ...attachProps }))),
        message.attaches.voice && (React.createElement(AttachVoice, { message: message, voice: message.attaches.voice, isFavorites: isFavorites, onPlayed: onPlayed })),
        message.attaches.audios &&
            message.attaches.audios.map((audio) => (React.createElement(AttachAudio, { source: audioSource, audio: audio, key: audio.id, isPrimary: !Message.hasText(message) &&
                    (message.kind === 'Normal' || isInModal) &&
                    attachmentsCount === 1, onWidthChange: onWidthChange, ...attachProps }))),
        message.attaches.podcast && (React.createElement(AttachAudioPlaylist, { playlist: message.attaches.podcast, ...attachProps })),
        message.attaches.audioPlaylists &&
            message.attaches.audioPlaylists.map((audioPlaylist) => (React.createElement(AttachAudioPlaylistNew, { key: audioPlaylist.id, source: audioSource, playlist: audioPlaylist, isCompact: isCompact, isPrimary: (message.kind === 'Normal' || isInModal) && attachmentsCount === 1, onWidthChange: onWidthChange, ...attachProps }))),
        message.attaches.artist && (React.createElement(AttachArtist, { source: audioSource, artist: message.attaches.artist, isCompact: isCompact, isPrimary: (message.kind === 'Normal' || isInModal) && attachmentsCount === 1, onWidthChange: onWidthChange, ...attachProps })),
        message.attaches.article && (React.createElement(AttachArticle, { article: message.attaches.article, isCompact: isCompact, isForwarded: isForwarded })),
        message.attaches.miniApps &&
            message.attaches.miniApps.map((miniApp) => (React.createElement(AttachMiniApp, { key: miniApp.id, isCompact: isCompact, isForwarded: isForwarded, isPrimary: !isCompact &&
                    !Message.hasText(message) &&
                    (message.kind === 'Normal' || isInModal) &&
                    attachmentsCount === 1, 
                // Для ФЧ отрисовываем только вспомогательный (компактный) вариант.
                isRich: !isCompact && attachmentsCount === 1, miniApp: miniApp, ...attachProps }))),
        message.attaches.miniAppWidgets &&
            message.attaches.miniAppWidgets.map((miniAppWidget) => (React.createElement(AttachMiniAppWidget, { key: miniAppWidget.app.id, isCompact: isCompact, isForwarded: isForwarded, isPrimary: !isCompact &&
                    !Message.hasText(message) &&
                    (message.kind === 'Normal' || isInModal) &&
                    attachmentsCount === 1, 
                // Для ФЧ отрисовываем только вспомогательный (компактный) вариант.
                isRich: !isCompact && attachmentsCount === 1, miniAppWidget: miniAppWidget, ...attachProps }))),
        message.attaches.moneyRequest && (React.createElement(AttachMoneyRequest, { isThemed: isThemed, moneyRequest: message.attaches.moneyRequest, ...attachProps })),
        message.attaches.moneyTransfer && (React.createElement(AttachMoneyTransfer, { moneyTransfer: message.attaches.moneyTransfer, ...attachProps })),
        message.attaches.donutLink && (React.createElement(AttachDonutLink, { donutLink: message.attaches.donutLink })),
        message.attaches.poll && (React.createElement(AttachPoll, { poll: message.attaches.poll, isCompact: isCompact, forwardLevel: forwardLevel, peerId: peerId, cmid: Message.getCmid(message) })),
        message.attaches.wall && (React.createElement(AttachWallNew, { autoplay: autoplay, wallOrWallReply: message.attaches.wall, peerId: peerId, chunks: message.chunks, cmid: Message.getCmid(message), forwardLevel: forwardLevel, isCompact: isCompact, isSmall: (forwardLevel > 0 && message.chunks.length > 0) ||
                attachmentsCount > 1 ||
                totalForwardedMessageCount > 1, isThemed: isThemed, isClipOnly: isClipOnly, onWidthChange: onWidthChange, onCloseMessageInModal: onCloseMessageInModal, getMediaAttachLinkPayload: getMediaAttachLinkPayload, ...attachProps })),
        message.attaches.channelMessage && (React.createElement(AttachChannelMessage, { autoplay: autoplay, channelMessage: message.attaches.channelMessage, peerId: peerId, chunks: message.chunks, cmid: Message.getCmid(message), forwardLevel: forwardLevel, isCompact: isCompact, isThemed: isThemed, onWidthChange: onWidthChange, onCloseMessageInModal: onCloseMessageInModal, getMediaAttachLinkPayload: getMediaAttachLinkPayload, ...attachProps })),
        message.attaches.wallReply && (React.createElement(AttachWallNew, { wallOrWallReply: message.attaches.wallReply, peerId: peerId, chunks: message.chunks, cmid: Message.getCmid(message), forwardLevel: forwardLevel, isCompact: isCompact, onWidthChange: onWidthChange, onCloseMessageInModal: onCloseMessageInModal, getMediaAttachLinkPayload: getMediaAttachLinkPayload, isThemed: isThemed, isClipOnly: isClipOnly, ...attachProps })),
        message.attaches.widget && (React.createElement(AttachWidget, { entrypoint: entrypoint, widget: message.attaches.widget, peerId: peerId }))));
};
export const MediaAttachments = ({ className, message, peerId, isInBubble, isForwarded, isCompact, forwardLevel = 0, rootIsOut, autoplay, showDateOutInsidePublicVideo = true, isUnread, forceAutoPlay = false, getMediaAttachLinkPayload, onWidthChange, withAuthorName, isThemed, isClipOnly, openClipCoOwnersModal, onPlayed, }) => {
    const isWithoutBubblesTheme = useWithoutBubblesTheme();
    const attachmentsCount = Attach.count(message.attaches);
    const isOut = rootIsOut || (message.kind !== 'Foreign' ? message.isOut : false);
    const withSwipeNavigation = (message.kind === 'Normal' || message.kind === 'Foreign') &&
        !message.isUnavailable;
    return (React.createElement("div", { className: cx('Attachments', className, isWithoutBubblesTheme && 'Attachments__withoutBubbles'), key: message.updatedAt },
        (message.attaches.videos ||
            message.attaches.photos ||
            message.attaches.docs) && (React.createElement(AttachPhotosVideos, { isCompact: isCompact, attaches: message.attaches, isInBubble: isInBubble, isThemed: isThemed, isClipOnly: isClipOnly, forwardLevel: forwardLevel, attachmentsCount: attachmentsCount, forceAutoPlay: forceAutoPlay, autoplay: autoplay, showDateOutInsidePublicVideo: showDateOutInsidePublicVideo, isUnread: isUnread, message: message, withSwipeNavigation: withSwipeNavigation, onWidthChange: onWidthChange, getAdditionalLinkPayload: getMediaAttachLinkPayload, openClipCoOwnersModal: openClipCoOwnersModal, onPlayed: onPlayed, isForwarded: !!isForwarded, isInChannel: false })),
        message.attaches.question && (React.createElement(AttachQuestion, { question: message.attaches.question, peerId: peerId, isForwarded: isForwarded, isOut: isOut, isInBubble: isInBubble, withAuthorName: withAuthorName }))));
};
//# sourceMappingURL=Attachments.js.map