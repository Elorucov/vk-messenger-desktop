import '../../ui/ChannelPostAttaches/ChannelPostAttaches.css';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import React, { useMemo, useCallback } from 'react';
import cx from 'classnames';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { AttachGraffiti } from '../../ui/AttachGraffiti/AttachGraffiti';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachMarket } from '../../ui/AttachMarket/AttachMarket';
import { AttachCurator } from '../../ui/AttachCurator/AttachCurator';
import { AttachStory } from '../../ui/AttachStory/AttachStory';
import { AttachGeo } from '../../ui/AttachGeo/AttachGeo';
import { AttachEvent } from '../../ui/AttachEvent/AttachEvent';
import { AttachNarrative } from '../../ui/AttachNarrative/AttachNarrative';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachAudioPlaylist } from '../../ui/AttachAudioPlaylist/AttachAudioPlaylist';
import { AttachArticle } from '../../ui/AttachArticle/AttachArticle';
import { AttachMiniApp } from '../../ui/AttachMiniApp/AttachMiniApp';
import { AttachStickerPack } from '../../ui/AttachStickerPack/AttachStickerPack';
import { AttachDonutLink } from '../../ui/AttachDonutLink/AttachDonutLink';
import { AttachPoll } from '../../ui/AttachPoll/AttachPoll';
import { AttachWall } from '../../ui/AttachWall/AttachWall';
import { AttachAudioPlaylistNew } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistNew';
import { AttachArtist } from '../../ui/AttachArtist/AttachArtist';
import { AttachMarketAlbum } from '../../ui/AttachMarketAlbum/AttachMarketAlbum';
import { AttachPhotoAlbum } from '../../ui/AttachPhotoAlbum/AttachPhotoAlbum';
import { AttachChannelStubDoc } from '../../ui/AttachChannelStub/AttachChannelStubDoc';
import { AttachChannelStubAudio } from '../../ui/AttachChannelStub/AttachChannelStubAudio';
export const ChannelPostAttaches = ({ className, channelId, attaches, postCmid, updatedAt, withSearchHighlight, searchQueryToHighlight, highlightColor, highlightColorOpacity, withBubblesTheme, isPrimary, getMediaAttachLinkPayload, onWidthChange, }) => {
    const audioSource = useMemo(() => postCmid
        ? {
            kind: 'post',
            cmid: postCmid,
            channelId,
        }
        : undefined, [channelId, postCmid]);
    const attachesCount = Attach.count(attaches);
    const handlOnAttachWallWidthChange = useCallback((width) => {
        if (onWidthChange && width) {
            /**
             * структура AttachWall отличается от остальных аттачей (у него есть длинная вертикальная полоса (2px) и отступ (8px) между ней и основным контентом аттача),
             * а также он не растягивается за поля бабла (2 * var(--ChannelPostPrimaryHorizontalPadding) = 24px)
             * и имеет марджин по бокам (2 * calc(var(--messageHorizontalIndent) - var(--messageAttachmentIndent)) = 10px)
             */
            const MAGIC_PADDING_NUMBER = 44;
            onWidthChange(width + MAGIC_PADDING_NUMBER);
        }
    }, [onWidthChange]);
    const hasAttaches = attaches.link ||
        Attach.docsWithoutPreview(attaches.docs) ||
        Attach.channelStubDocsWithoutPreview(attaches.channelStubDoc) ||
        attaches.audios ||
        attaches.channelStubAudio ||
        attaches.podcast ||
        attaches.audioPlaylists ||
        attaches.artist ||
        attaches.article ||
        attaches.miniApps ||
        attaches.geo ||
        attaches.event ||
        attaches.wall ||
        attaches.wallReply ||
        attaches.story ||
        attaches.narratives ||
        attaches.poll ||
        attaches.market ||
        attaches.marketAlbum ||
        attaches.album ||
        attaches.graffiti ||
        attaches.donutLink ||
        attaches.curator ||
        attaches.sticker ||
        attaches.stickerPack;
    if (!hasAttaches) {
        return null;
    }
    const attachProps = {
        isInBubble: true,
        isOut: false,
    };
    return (React.createElement("div", { className: cx('ChannelPostAttaches', className), key: updatedAt },
        attaches.sticker && (React.createElement(AttachSticker, { size: 128, sticker: attaches.sticker, iconPosition: "rightRelative" })),
        attaches.graffiti && (React.createElement(AttachGraffiti, { graffiti: attaches.graffiti, isInBubble: true, onWidthChange: onWidthChange })),
        attaches.curator &&
            attaches.curator.map((c) => (React.createElement(AttachCurator, { key: `${c.kind}${c.id}`, attach: c, ...attachProps }))),
        attaches.stickerPack && (React.createElement(AttachStickerPack, { attach: attaches.stickerPack, ...attachProps })),
        attaches.link && React.createElement(AttachLink, { link: attaches.link, ...attachProps }),
        attaches.market && (React.createElement(AttachMarket, { market: attaches.market, ...attachProps })),
        attaches.marketAlbum && (React.createElement(AttachMarketAlbum, { marketAlbum: attaches.marketAlbum, ...attachProps })),
        attaches.story && (React.createElement(AttachStory, { story: attaches.story, ...attachProps, onWidthChange: onWidthChange })),
        attaches.geo && (React.createElement(AttachGeo, { geo: attaches.geo, ...attachProps, onWidthChange: onWidthChange })),
        attaches.event && (React.createElement(AttachEvent, { event: attaches.event, ...attachProps })),
        attaches.narratives &&
            attaches.narratives.map((narrative) => (React.createElement(AttachNarrative, { narrative: narrative, ...attachProps }))),
        attaches.album && (React.createElement(AttachPhotoAlbum, { album: attaches.album, ...attachProps })),
        Attach.docsWithoutPreview(attaches.docs)?.map((doc) => (React.createElement(AttachDoc, { key: doc.id, doc: doc, ...attachProps }))),
        Attach.channelStubDocsWithoutPreview(attaches.channelStubDoc)?.map((doc, idx) => (React.createElement(AttachChannelStubDoc, { key: `AttachChannelStubDoc-${idx}`, attach: doc }))),
        attaches.audios &&
            attaches.audios.map((audio) => (React.createElement(AttachAudio, { className: cx(withBubblesTheme && 'ChannelPostAttaches__audio'), source: audioSource, audio: audio, key: audio.id, isPrimary: isPrimary && attachesCount === 1, ...attachProps }))),
        attaches.channelStubAudio &&
            attaches.channelStubAudio.map((audio) => (React.createElement(AttachChannelStubAudio, { className: cx(withBubblesTheme && 'ChannelPostAttaches__audio'), attach: audio, isPrimary: isPrimary && attachesCount === 1 }))),
        attaches.podcast && (React.createElement(AttachAudioPlaylist, { playlist: attaches.podcast, ...attachProps })),
        attaches.audioPlaylists &&
            attaches.audioPlaylists.map((audioPlaylist) => (React.createElement(AttachAudioPlaylistNew, { className: cx(withBubblesTheme && 'ChannelPostAttaches__playlistNew'), key: audioPlaylist.id, playlist: audioPlaylist, source: audioSource, isPrimary: attachesCount === 1, ...attachProps }))),
        attaches.artist && (React.createElement(AttachArtist, { source: audioSource, artist: attaches.artist, isPrimary: attachesCount === 1, ...attachProps })),
        attaches.article && React.createElement(AttachArticle, { article: attaches.article }),
        attaches.miniApps &&
            attaches.miniApps.map((miniApp) => (React.createElement(AttachMiniApp, { key: miniApp.id, miniApp: miniApp, ...attachProps }))),
        attaches.donutLink && React.createElement(AttachDonutLink, { donutLink: attaches.donutLink }),
        attaches.poll && (React.createElement(AttachPoll, { poll: attaches.poll, channelId: channelId, postCmid: postCmid })),
        attaches.wall && (React.createElement(AttachWall, { wallOrWallReply: attaches.wall, chunks: attaches.wall.chunks, peerId: Peer.resolveId(channelId), onWidthChange: handlOnAttachWallWidthChange, getMediaAttachLinkPayload: getMediaAttachLinkPayload, withSearchHighlight: withSearchHighlight, searchQueryToHighlight: searchQueryToHighlight, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, ...attachProps })),
        attaches.wallReply && (React.createElement(AttachWall, { wallOrWallReply: attaches.wallReply, chunks: attaches.wallReply.chunks, peerId: Peer.resolveId(channelId), getMediaAttachLinkPayload: getMediaAttachLinkPayload, onWidthChange: handlOnAttachWallWidthChange, withSearchHighlight: withSearchHighlight, searchQueryToHighlight: searchQueryToHighlight, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity, ...attachProps }))));
};
//# sourceMappingURL=ChannelPostAttaches.js.map