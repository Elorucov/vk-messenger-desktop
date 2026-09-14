import '../../ui/AttachWall/AttachWall.css';
import React, { useMemo } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import * as Channel from '../../../core/model/Channel';
import cx from 'classnames';
import { Link, ExternalLink } from '../../ui/Link/Link';
import { Avatar } from '../../ui/Avatar/Avatar';
import { useBrowserEnv, useOwner, usePeers } from '../../hooks/misc';
import { exhaustivenessCheck, isSameYear } from '../../../core/utils/misc';
import { AttachPhotosVideos } from '../../ui/AttachPhotosVideos/AttachPhotosVideos';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachMarket } from '../../ui/AttachMarket/AttachMarket';
import { AttachStory } from '../../ui/AttachStory/AttachStory';
import { AttachGeo } from '../../ui/AttachGeo/AttachGeo';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachAudioPlaylist } from '../../ui/AttachAudioPlaylist/AttachAudioPlaylist';
import { AttachMiniApp } from '../../ui/AttachMiniApp/AttachMiniApp';
import { AttachWallHistory } from '../../ui/AttachWallHistory/AttachWallHistory';
import { AttachPoll } from '../../ui/AttachPoll/AttachPoll';
import { AttachCurator } from '../../ui/AttachCurator/AttachCurator';
import { AttachGraffiti } from '../../ui/AttachGraffiti/AttachGraffiti';
import { AttachArticle } from '../../ui/AttachArticle/AttachArticle';
import { AttachDonutLink } from '../../ui/AttachDonutLink/AttachDonutLink';
import { IRouter } from '../../../data/env/IRouter';
import { AttachNarrative } from '../../ui/AttachNarrative/AttachNarrative';
import { Emoji } from '../../ui/Emoji/Emoji';
import { AttachEvent } from '../../ui/AttachEvent/AttachEvent';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { AttachPhotoAlbum } from '../../ui/AttachPhotoAlbum/AttachPhotoAlbum';
import { AttachArtist } from '../../ui/AttachArtist/AttachArtist';
import { AttachStickerPack } from '../../ui/AttachStickerPack/AttachStickerPack';
import { AttachAudioPlaylistNew } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistNew';
import { useRouter } from '../../ui/Router/Router';
import { applyParentRouteParam } from '../../../data/env/Router';
import { Highlighter, } from '../../ui/Highlighter/Highlighter';
import { AttachMarketAlbum } from '../../ui/AttachMarketAlbum/AttachMarketAlbum';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { useNow } from '../../hooks/useNow';
export const OpenPostButton = ({ attach, className, onCloseMessageInModal, children }) => {
    const { router, screenRoute } = useRouter();
    const route = useMemo(() => {
        const { route } = router.fromEntity({
            kind: 'AttachProxyRoute',
            attach,
            organiser: router.screenRoute.organiser,
        }, IRouter.Action.Push);
        if (route && route.kind === 'ChannelRoute') {
            return applyParentRouteParam(screenRoute, route);
        }
        return;
    }, [attach, router, screenRoute]);
    return route ? (React.createElement(Link, { className: className, to: route, onNavigate: onCloseMessageInModal }, children)) : (React.createElement(Link, { to: {
            kind: 'AttachProxyRoute',
            attach,
            organiser: router.screenRoute.organiser,
        }, onNavigate: onCloseMessageInModal, className: className }, children));
};
export const AttachWall = ({ peerId, chunks, wallOrWallReply, cmid, forwardLevel = 0, isCompact = false, isInBubble, isOut, withSearchHighlight, searchQueryToHighlight, highlightColor, highlightColorOpacity, autoplay, onWidthChange, getMediaAttachLinkPayload, }) => {
    const owner = useOwner();
    const { lang, router } = useBrowserEnv();
    const now = useNow();
    const peers = usePeers();
    const wallOrWallReplyLink = router.toUrl({
        kind: 'AttachProxyRoute',
        attach: wallOrWallReply,
        organiser: router.screenRoute.organiser,
    });
    const author = Peer.safeGet(peers, wallOrWallReply.authorId);
    const isWallDeleted = wallOrWallReply.kind === 'Wall' && wallOrWallReply.isDeleted;
    const attachProps = {
        isInBubble,
        isOut,
    };
    const attachOwner = wallOrWallReply.ownerId !== undefined
        ? Peer.safeGet(peers, wallOrWallReply.ownerId)
        : undefined;
    const isUnavailable = attachOwner !== undefined
        ? getIsUnavailable({
            owner,
            attachAuthor: author,
            attachOwner,
            wallOrWallReply,
        })
        : false;
    const header = {
        Wall: author.kind === 'User'
            ? lang.use('me_fc_wall_post_user')
            : lang.use('me_fc_wall_post_group'),
        WallReply: lang.use('me_fc_wall_post_reply'),
    }[wallOrWallReply.kind];
    const openBtnCaption = {
        Wall: lang.use('me_fc_open_wall_post'),
        WallReply: lang.use('me_fc_open_wall_post_reply'),
    }[wallOrWallReply.kind];
    const isChannelRoute = wallOrWallReply.kind !== 'WallReply' && Peer.isGroupPeerId(author.id);
    const authorRoute = isChannelRoute
        ? {
            kind: 'ChannelRoute',
            channelId: Channel.resolveId(author.id),
        }
        : {
            kind: 'PeerPanel',
            peerId: author.id,
            screenName: Peer.screenName(author),
        };
    const stickerSize = isCompact ? 128 : 168;
    const getHighlightedText = (v) => withSearchHighlight && searchQueryToHighlight ? (React.createElement(Highlighter, { search: searchQueryToHighlight, text: v, highlightColor: highlightColor, highlightColorOpacity: highlightColorOpacity })) : (v);
    const text = (React.createElement("span", { className: "AttachWall__message" }, wallOrWallReply.chunks.map((chunk, i) => {
        switch (chunk.kind) {
            case 'Text':
                return getHighlightedText(chunk.text);
            case 'Emoji':
                return React.createElement(Emoji, { emoji: chunk.text, key: i });
            case 'Code':
                return React.createElement(CodeBlock, { code: chunk, key: i });
            case 'Mention': {
                const peer = peers.get(chunk.peerId);
                return (React.createElement(Link, { key: i, to: {
                        kind: 'PeerPanel',
                        peerId: chunk.peerId,
                        screenName: peer && Peer.screenName(peer),
                    }, className: "AttachWall__link AttachWall__link--text" }, chunk.displayName));
            }
            case 'ScreenNameMention':
                return (React.createElement(Link, { key: i, to: {
                        kind: 'ScreenNameProxyRoute',
                        screenName: chunk.screenName,
                    }, className: "AttachWall__link AttachWall__link--text" }, chunk.displayName));
            case 'MassMention':
                return React.createElement(React.Fragment, { key: i }, chunk.displayName);
            case 'Email':
                return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: "AttachWall__link AttachWall__link--text" }, getHighlightedText(chunk.email)));
            case 'Url':
                return (React.createElement(ExternalLink, { key: i, href: chunk.href, className: "AttachWall__link AttachWall__link--text" }, getHighlightedText(chunk.caption)));
            case 'Hashtag':
                return (React.createElement(Link, { key: i, to: {
                        kind: 'HashtagProxyRoute',
                        tag: chunk.tag,
                    }, className: "AttachWall__link AttachWall__link--text" }, chunk.tag));
            case 'HashtagMention':
                return (React.createElement(Link, { key: i, to: {
                        kind: 'HashtagMentionProxyRoute',
                        tag: chunk.tag,
                        authorId: author.id,
                    }, className: "AttachWall__link AttachWall__link--text" },
                    chunk.tag,
                    "@",
                    chunk.screenName));
            case 'LineBreak':
                return React.createElement("br", { key: i });
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
    const vkComLegacyAnalyticsPostId = wallOrWallReply.ownerId
        ? `${wallOrWallReply.ownerId}_${wallOrWallReply.id}`
        : undefined;
    const mediaAttaches = (wallOrWallReply.attaches.videos ||
        wallOrWallReply.attaches.photos ||
        Attach.docsWithPreview(wallOrWallReply.attaches.docs)) && (React.createElement("div", { className: "AttachWall__attaches" },
        React.createElement(AttachPhotosVideos, { attaches: wallOrWallReply.attaches, forwardLevel: forwardLevel + 1, onWidthChange: onWidthChange, autoplay: autoplay, vkComLegacyAnalyticsPostId: vkComLegacyAnalyticsPostId, getAdditionalLinkPayload: getMediaAttachLinkPayload, isForwarded: false, isInChannel: false, ...attachProps })));
    const attaches = (React.createElement("div", { className: "AttachWall__attaches" },
        wallOrWallReply.attaches.graffiti && (React.createElement(AttachGraffiti, { graffiti: wallOrWallReply.attaches.graffiti, isInBubble: isInBubble, forwardLevel: forwardLevel + 1, onWidthChange: onWidthChange })),
        wallOrWallReply.attaches.curator &&
            wallOrWallReply.attaches.curator.map((curator) => (React.createElement(AttachCurator, { key: `${curator.kind}${curator.id}`, attach: curator, ...attachProps }))),
        wallOrWallReply.attaches.stickerPack && (React.createElement(AttachStickerPack, { attach: wallOrWallReply.attaches.stickerPack, ...attachProps })),
        wallOrWallReply.attaches.link && (React.createElement(AttachLink, { link: wallOrWallReply.attaches.link, ...attachProps })),
        wallOrWallReply.attaches.album && (React.createElement(AttachPhotoAlbum, { album: wallOrWallReply.attaches.album, ...attachProps })),
        wallOrWallReply.attaches.market && (React.createElement(AttachMarket, { market: wallOrWallReply.attaches.market, ...attachProps })),
        wallOrWallReply.attaches.marketAlbum && (React.createElement(AttachMarketAlbum, { marketAlbum: wallOrWallReply.attaches.marketAlbum, ...attachProps })),
        wallOrWallReply.attaches.story && (React.createElement(AttachStory, { story: wallOrWallReply.attaches.story, onWidthChange: onWidthChange })),
        wallOrWallReply.attaches.geo && (React.createElement(AttachGeo, { geo: wallOrWallReply.attaches.geo, onWidthChange: onWidthChange, ...attachProps })),
        wallOrWallReply.attaches.event && (React.createElement(AttachEvent, { event: wallOrWallReply.attaches.event, ...attachProps })),
        wallOrWallReply.attaches.narratives &&
            wallOrWallReply.attaches.narratives.map((narrative) => (React.createElement(AttachNarrative, { narrative: narrative, ...attachProps }))),
        Attach.docsWithoutPreview(wallOrWallReply.attaches.docs)?.map((doc) => (React.createElement(AttachDoc, { key: doc.id, doc: doc, forwardLevel: forwardLevel + 1, ...attachProps }))),
        wallOrWallReply.attaches.audios &&
            wallOrWallReply.attaches.audios.map((audio) => (React.createElement(AttachAudio, { audio: audio, key: audio.id, ...attachProps }))),
        wallOrWallReply.attaches.podcast && (React.createElement(AttachAudioPlaylist, { playlist: wallOrWallReply.attaches.podcast, ...attachProps })),
        wallOrWallReply.attaches.audioPlaylists &&
            wallOrWallReply.attaches.audioPlaylists.map((audioPlaylist) => (React.createElement(AttachAudioPlaylistNew, { key: audioPlaylist.id, playlist: audioPlaylist, isInBubble: isInBubble }))),
        wallOrWallReply.attaches.artist && (React.createElement(AttachArtist, { artist: wallOrWallReply.attaches.artist, ...attachProps })),
        wallOrWallReply.attaches.article && (React.createElement(AttachArticle, { article: wallOrWallReply.attaches.article, isCompact: isCompact, isForwarded: true })),
        wallOrWallReply.attaches.miniApps &&
            wallOrWallReply.attaches.miniApps.map((miniApp) => (React.createElement(AttachMiniApp, { key: miniApp.id, miniApp: miniApp, isCompact: isCompact, isForwarded: true, ...attachProps }))),
        wallOrWallReply.attaches.donutLink && (React.createElement(AttachDonutLink, { donutLink: wallOrWallReply.attaches.donutLink })),
        wallOrWallReply.attaches.poll && (React.createElement(AttachPoll, { poll: wallOrWallReply.attaches.poll, isCompact: isCompact, forwardLevel: forwardLevel + 1, peerId: peerId, cmid: cmid })),
        wallOrWallReply.attaches.wallHistory && (React.createElement(AttachWallHistory, { wallHistory: wallOrWallReply.attaches.wallHistory, title: wallOrWallReply.attaches.wallHistory.text || header, meta: wallOrWallReply.attaches.wallHistory.text
                ? header
                : lang.use('me_attaches_link') })),
        wallOrWallReply.attaches.sticker && (React.createElement(AttachSticker, { size: stickerSize, sticker: wallOrWallReply.attaches.sticker, commentId: cmid, iconPosition: "rightRelative" }))));
    return (React.createElement("div", { className: cx('AttachWall', {
            'AttachWall--withMessage': chunks.length,
        }) },
        React.createElement("div", { className: "AttachWall__info" }, header),
        React.createElement("div", { className: "AttachWall__content" },
            React.createElement("header", { className: "AttachWall__header" },
                React.createElement("div", { className: "AttachWall__avatar" },
                    React.createElement(Link, { to: authorRoute, "aria-hidden": true, tabIndex: -1 },
                        React.createElement(Avatar, { peer: author, size: 32 }))),
                React.createElement("div", { className: "AttachWall__titleLink" }, (author.kind === 'User' || author.kind === 'Group') && (React.createElement(Link, { to: authorRoute, className: "AttachWall__link" }, Peer.name(author)))),
                React.createElement("div", { className: "AttachWall__subtitle" }, wallOrWallReply.kind === 'Wall' && wallOrWallReply.isAds
                    ? lang.use('me_attach_sub_title_ads')
                    : lang.use(isSameYear(now, wallOrWallReply.date)
                        ? 'global_short_date_time'
                        : 'global_date_year_time', {
                        now,
                        date: wallOrWallReply.date,
                    }))),
            mediaAttaches,
            text,
            attaches,
            !isUnavailable && wallOrWallReplyLink && !isWallDeleted && (React.createElement(OpenPostButton, { attach: wallOrWallReply, className: "AttachWall__link AttachWall__link--post" }, openBtnCaption)))));
};
function getIsUnavailable({ owner, attachAuthor, attachOwner, wallOrWallReply, }) {
    if (owner.id === attachOwner.id || owner.id === attachAuthor.id) {
        return false;
    }
    if (attachOwner.kind === 'Group') {
        return attachOwner.isClosed && attachOwner.membership !== 'member';
    }
    if (attachOwner.kind === 'User') {
        if (attachOwner.isBlacklisted || attachOwner.isProfileClosed) {
            return true;
        }
        if (wallOrWallReply.kind === 'Wall') {
            return (attachOwner.friendship !== 'friends' &&
                wallOrWallReply.isVisibleFor !== 'all');
        }
    }
    return false;
}
//# sourceMappingURL=AttachWall.js.map