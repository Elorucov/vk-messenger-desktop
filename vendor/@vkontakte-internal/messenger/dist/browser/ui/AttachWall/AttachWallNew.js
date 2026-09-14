import '../../ui/AttachWall/AttachWallNew.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import cx from 'classnames';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { useBrowserEnv, useFeatureFlags, useOwner, usePeers, } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { AttachPhotosVideos } from '../../ui/AttachPhotosVideos/AttachPhotosVideos';
import { AttachLink } from '../../ui/AttachLink/AttachLink';
import { AttachMarket } from '../../ui/AttachMarket/AttachMarket';
import { AttachStory } from '../../ui/AttachStory/AttachStory';
import { AttachGeo } from '../../ui/AttachGeo/AttachGeo';
import { AttachDoc } from '../../ui/AttachDoc/AttachDoc';
import { AttachAudio } from '../../ui/AttachAudio/AttachAudio';
import { AttachAudioPlaylist } from '../../ui/AttachAudioPlaylist/AttachAudioPlaylist';
import { AttachMiniApp } from '../../ui/AttachMiniApp/AttachMiniApp';
import { AttachMoneyTransfer } from '../../ui/AttachMoneyTransfer/AttachMoneyTransfer';
import { AttachPoll } from '../../ui/AttachPoll/AttachPoll';
import { AttachGraffiti } from '../../ui/AttachGraffiti/AttachGraffiti';
import { AttachArticle } from '../../ui/AttachArticle/AttachArticle';
import { AttachDonutLink } from '../../ui/AttachDonutLink/AttachDonutLink';
import { AttachNarrative } from '../../ui/AttachNarrative/AttachNarrative';
import { Emoji } from '../../ui/Emoji/Emoji';
import { AttachEvent } from '../../ui/AttachEvent/AttachEvent';
import { AttachSticker } from '../../ui/AttachSticker/AttachSticker';
import { AttachArtist } from '../../ui/AttachArtist/AttachArtist';
import { AttachCurator } from '../../ui/AttachCurator/AttachCurator';
import { AttachAudioPlaylistNew } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistNew';
import { Icon28DeleteOutline, Icon28DonateOutline } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { AttachStickerPack } from '../../ui/AttachStickerPack/AttachStickerPack';
import { getAttachText } from '../../ui/AttachText/AttachText';
import { useConvoAttachesGetMissedPeers } from '../../hooks/useConvoAttaches';
import { OpenPostButton } from '../../ui/AttachWall/AttachWall';
import { AttachMarketAlbum } from '../../ui/AttachMarketAlbum/AttachMarketAlbum';
import { AttachPhotoAlbum } from '../../ui/AttachPhotoAlbum/AttachPhotoAlbum';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { AttachWallHeader } from '../../ui/AttachWall/AttachWallHeader/AttachWallHeader';
const getCoownersPeerIds = (wallOrWallReply) => {
    return (('coownerPeerIds' in wallOrWallReply
        ? wallOrWallReply.coownerPeerIds
        : wallOrWallReply.attaches?.wall?.coownerPeerIds) || []);
};
const checkCoownersFetched = (wallOrWallReply, peers) => {
    return !getCoownersPeerIds(wallOrWallReply).some((coownerPeerId) => !peers.has(coownerPeerId));
};
export const AttachWallNew = ({ peerId, chunks, wallOrWallReply, cmid, forwardLevel = 0, isCompact = false, isInBubble, isThemed = false, isOut, isClipOnly, autoplay, isSmall = false, onWidthChange, onCloseMessageInModal, getMediaAttachLinkPayload, }) => {
    const owner = useOwner();
    const { lang, router, stats } = useBrowserEnv();
    const { vkm_video_padding_fix, vkm_new_bubbles_width_calc } = useFeatureFlags();
    const peers = usePeers();
    const [maxWidth, setMaxWidth] = useState(undefined);
    const wallOrWallReplyLink = router.toUrl({
        kind: 'AttachProxyRoute',
        attach: wallOrWallReply,
        organiser: router.screenRoute.organiser,
    });
    const { fetchProfilesAndGroups } = useConvoAttachesGetMissedPeers([
        wallOrWallReply.authorId,
        wallOrWallReply.ownerId
            ? wallOrWallReply.ownerId
            : wallOrWallReply.authorId,
        ...getCoownersPeerIds(wallOrWallReply),
    ]);
    const [peersCached, setPeersCached] = useState(false);
    useEffect(() => {
        if (!peers.has(wallOrWallReply.authorId) ||
            (wallOrWallReply.ownerId && !peers.has(wallOrWallReply.ownerId)) ||
            !checkCoownersFetched(wallOrWallReply, peers)) {
            fetchProfilesAndGroups().then(() => setPeersCached(true));
        }
        else {
            setPeersCached(true);
        }
        // Делаем загрузку недостающих пиров при первом рендере
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    let author = undefined;
    try {
        /** в большой вложенности иногда от бэка не приходят пиры
         * поэтому в fetchProfilesAndGroups запрашиваем их,
         * а пока они не пришли не рисуем блок
         */
        author = Peer.safeGet(peers, wallOrWallReply.authorId);
    }
    catch {
        author = Peer.safeGet(peers, Peer.resolveId());
    }
    const coownerPeers = useMemo(() => {
        return getCoownersPeerIds(wallOrWallReply).reduce((acc, peerId) => {
            let author;
            try {
                author = Peer.safeGet(peers, peerId);
            }
            catch {
                author = Peer.safeGet(peers, Peer.resolveId());
            }
            author && acc.push(author);
            return acc;
        }, []);
    }, [wallOrWallReply, peers]);
    const isWallDeleted = wallOrWallReply.kind === 'Wall' && wallOrWallReply.isDeleted;
    const attachProps = {
        isInBubble,
        isOut,
    };
    let attachOwner;
    try {
        attachOwner =
            wallOrWallReply.ownerId !== undefined
                ? Peer.safeGet(peers, wallOrWallReply.ownerId)
                : undefined;
    }
    catch {
        attachOwner = Peer.safeGet(peers, Peer.resolveId());
    }
    const isUnavailable = attachOwner !== undefined
        ? getIsUnavailable({
            owner,
            attachAuthor: author,
            attachOwner,
            wallOrWallReply,
        })
        : false;
    const openBtnCaption = {
        Wall: lang.use('me_fc_open_wall_post'),
        WallReply: lang.use('me_fc_open_wall_post_reply'),
        WallHistory: lang.use('me_fc_open_wall_post'),
    }[wallOrWallReply.kind];
    const stickerSize = isCompact ? 128 : 168;
    const text = (React.createElement("span", { className: "AttachWallNew__message" }, wallOrWallReply.chunks.map((chunk, i) => {
        switch (chunk.kind) {
            case 'Text':
                return React.createElement(React.Fragment, { key: i }, chunk.text);
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
                    }, className: "AttachWallNew__link AttachWallNew__link--text" }, chunk.displayName));
            }
            case 'ScreenNameMention':
                return (React.createElement(Link, { key: i, to: {
                        kind: 'ScreenNameProxyRoute',
                        screenName: chunk.screenName,
                    }, className: "AttachWallNew__link AttachWallNew__link--text" }, chunk.displayName));
            case 'MassMention':
                return React.createElement(React.Fragment, { key: i }, chunk.displayName);
            case 'Email':
                return (React.createElement(ExternalLink, { key: i, href: `mailto:${chunk.email}`, className: "AttachWallNew__link AttachWallNew__link--text" }, chunk.email));
            case 'Url':
                return (React.createElement(ExternalLink, { key: i, href: chunk.href, className: "AttachWallNew__link AttachWallNew__link--text" }, chunk.caption));
            case 'Hashtag':
                return (React.createElement(Link, { key: i, to: {
                        kind: 'HashtagProxyRoute',
                        tag: chunk.tag,
                    }, className: "AttachWallNew__link AttachWallNew__link--text" }, chunk.tag));
            case 'HashtagMention':
                return (React.createElement(Link, { key: i, to: {
                        kind: 'HashtagMentionProxyRoute',
                        tag: chunk.tag,
                        authorId: author?.id,
                    }, className: "AttachWallNew__link AttachWallNew__link--text" },
                    chunk.tag,
                    "@",
                    chunk.screenName));
            case 'LineBreak':
                return isSmall ? React.createElement(React.Fragment, { key: i }) : React.createElement("br", { key: i });
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
    const [useCSSMinContentWidth, setUseCSSMinContentWidth] = useState(false);
    const onMediaWidthChange = (width, ignorePrev) => {
        if (vkm_new_bubbles_width_calc) {
            setUseCSSMinContentWidth(true);
            onWidthChange?.(0, ignorePrev);
            return;
        }
        if (width > (maxWidth || 0)) {
            setMaxWidth(width);
        }
    };
    const handleDonutButtonClick = useCallback(() => {
        stats.logEvent({
            type: 'type_click',
            screen: 'donut_content_repost',
            type_click: {
                item: {
                    type: 'click_item',
                    id: wallOrWallReply.id,
                    owner_id: wallOrWallReply.ownerId,
                },
                type: 'type_donut_support_author_click',
                type_donut_support_author_click: {
                    item_type: 'teaser_post',
                },
            },
        });
    }, [wallOrWallReply, stats]);
    const isDonut = 'donut' in wallOrWallReply && wallOrWallReply.donut?.placeholder;
    const donutPlaceholderActionUrl = useMemo(() => {
        if ('donut' in wallOrWallReply) {
            const actionUrl = wallOrWallReply.donut?.placeholder?.button?.action?.url;
            if (actionUrl) {
                const [url, query] = actionUrl.split('?');
                const searchParams = new URLSearchParams(query);
                if (!searchParams.has('analyticsScreen')) {
                    searchParams.append('analyticsScreen', 'donut_content_repost');
                }
                return `${url}?${searchParams.toString()}`;
            }
        }
        return undefined;
    }, [wallOrWallReply]);
    /**
     * Для публичных видео
     */
    const isPublicVideo = Attach.hasPublicVideo(wallOrWallReply.attaches);
    const vkComLegacyAnalyticsPostId = wallOrWallReply.ownerId
        ? `${wallOrWallReply.ownerId}_${wallOrWallReply.id}`
        : undefined;
    const mediaAttaches = (wallOrWallReply.attaches.photos ||
        wallOrWallReply.attaches.videos ||
        Attach.docsWithPreview(wallOrWallReply.attaches.docs)) && (React.createElement("div", { className: "AttachWallNew__attaches" },
        React.createElement(AttachPhotosVideos, { attaches: wallOrWallReply.attaches, forwardLevel: vkm_video_padding_fix ? forwardLevel : forwardLevel + 1, autoplay: autoplay, vkComLegacyAnalyticsPostId: vkComLegacyAnalyticsPostId, attachmentsCount: Attach.count(wallOrWallReply.attaches), onWidthChange: onMediaWidthChange, getAdditionalLinkPayload: getMediaAttachLinkPayload, isThemed: isThemed, isClipOnly: isClipOnly, isForwarded: false, isInChannel: false, ...attachProps })));
    const attaches = (React.createElement("div", { className: cx('AttachWallNew__attaches', {
            'AttachWallNew__attaches--sticker': wallOrWallReply.attaches.sticker,
        }) },
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
            wallOrWallReply.attaches.narratives.map((narrative) => (React.createElement(AttachNarrative, { key: narrative.id, narrative: narrative, ...attachProps }))),
        Attach.docsWithoutPreview(wallOrWallReply.attaches.docs)?.map((doc) => (React.createElement(AttachDoc, { key: doc.id, doc: doc, forwardLevel: forwardLevel + 1, ...attachProps }))),
        wallOrWallReply.attaches.audios &&
            wallOrWallReply.attaches.audios.map((audio) => (React.createElement(AttachAudio, { audio: audio, key: audio.id, ...attachProps }))),
        wallOrWallReply.attaches.podcast && (React.createElement(AttachAudioPlaylist, { playlist: wallOrWallReply.attaches.podcast, ...attachProps })),
        wallOrWallReply.attaches.audioPlaylists &&
            wallOrWallReply.attaches.audioPlaylists.map((audioPlaylist) => (React.createElement(AttachAudioPlaylistNew, { key: audioPlaylist.id, playlist: audioPlaylist, isInBubble: isInBubble }))),
        wallOrWallReply.attaches.artist && (React.createElement(AttachArtist, { artist: wallOrWallReply.attaches.artist, ...attachProps })),
        wallOrWallReply.attaches.article && (React.createElement(AttachArticle, { article: wallOrWallReply.attaches.article, isCompact: isCompact, isForwarded: true })),
        wallOrWallReply.attaches.miniApps &&
            wallOrWallReply.attaches.miniApps.map((miniApp, index) => (React.createElement(AttachMiniApp, { key: index, miniApp: miniApp, ...attachProps }))),
        wallOrWallReply.attaches.moneyTransfer && (React.createElement(AttachMoneyTransfer, { moneyTransfer: wallOrWallReply.attaches.moneyTransfer, ...attachProps })),
        wallOrWallReply.attaches.donutLink && (React.createElement(AttachDonutLink, { donutLink: wallOrWallReply.attaches.donutLink })),
        wallOrWallReply.attaches.poll && (React.createElement(AttachPoll, { poll: wallOrWallReply.attaches.poll, isCompact: isCompact, forwardLevel: forwardLevel + 1, peerId: peerId, cmid: cmid })),
        wallOrWallReply.attaches.wallHistory && (React.createElement(AttachWallNew, { wallOrWallReply: wallOrWallReply.attaches.wallHistory, peerId: peerId, chunks: wallOrWallReply.attaches.wallHistory.chunks, cmid: cmid, forwardLevel: forwardLevel + 1, isCompact: isCompact, isInBubble: isInBubble, isOut: isOut, isSmall: true, isThemed: isThemed, isClipOnly: isClipOnly, onWidthChange: onWidthChange, onCloseMessageInModal: onCloseMessageInModal, getMediaAttachLinkPayload: getMediaAttachLinkPayload })),
        wallOrWallReply.attaches.wall && (React.createElement(AttachWallNew, { wallOrWallReply: wallOrWallReply.attaches.wall, peerId: peerId, chunks: wallOrWallReply.attaches.wall.chunks, cmid: cmid, forwardLevel: forwardLevel + 1, isCompact: isCompact, isInBubble: isInBubble, isThemed: isThemed, isOut: isOut, isSmall: true, isClipOnly: isClipOnly, onWidthChange: onWidthChange, getMediaAttachLinkPayload: getMediaAttachLinkPayload })),
        wallOrWallReply.attaches.sticker && (React.createElement(AttachSticker, { size: stickerSize, sticker: wallOrWallReply.attaches.sticker, commentId: cmid, iconPosition: "rightRelative" }))));
    return (React.createElement("div", { className: cx('AttachWallNew', {
            'AttachWallNew--withMessage': chunks.length,
            'AttachWallNew--withReply': wallOrWallReply.kind === 'WallReply',
            'AttachWallNew--compact': isCompact,
            'AttachWallNew--themed': isThemed,
        }) },
        React.createElement("div", { className: cx('AttachWallNew__content', {
                'AttachWallNew--fitMediaAttachesWidth': useCSSMinContentWidth,
                'AttachWallNew__content--withLeft': forwardLevel > 0 && wallOrWallReply.kind === 'WallHistory', // доп условие для Queued чтобы не прыгали после получения актуальных данных из лп
            }), style: { maxWidth: maxWidth } },
            wallOrWallReply.kind === 'WallReply' && (React.createElement("div", { className: "AttachWallNew__WallReply" }, lang.use('me_attaches_wall_reply_label'))),
            (author.kind === 'User' || author.kind === 'Group') && (React.createElement(AttachWallHeader, { wallOrWallReply: wallOrWallReply, coownerPeers: coownerPeers, author: author, peersCached: peersCached })),
            !isSmall && (React.createElement(React.Fragment, null,
                !isPublicVideo && mediaAttaches,
                !isDonut && !isWallDeleted && text,
                isPublicVideo && mediaAttaches,
                attaches,
                !isUnavailable &&
                    wallOrWallReplyLink &&
                    wallOrWallReply.kind !== 'WallHistory' &&
                    !isWallDeleted &&
                    !isDonut && (React.createElement("div", { className: "AttachWallNew__linkWrapper" },
                    React.createElement(OpenPostButton, { attach: wallOrWallReply, onCloseMessageInModal: onCloseMessageInModal, className: "AttachWallNew__link AttachWallNew__link--post" }, openBtnCaption))),
                isDonut && (React.createElement("div", { className: "AttachWallNew__donut" },
                    React.createElement(Icon28DonateOutline, { width: 48, height: 48 }),
                    lang.use('me_attaches_wall_donut'),
                    'donut' in wallOrWallReply &&
                        wallOrWallReply.donut?.placeholder?.button && (React.createElement("div", { className: "AttachWallNew__linkWrapper" },
                        React.createElement("a", { href: donutPlaceholderActionUrl, target: "_blank", rel: "noreferrer" },
                            React.createElement(Button, { className: "AttachDonutLink__button", mode: "primary", onClick: handleDonutButtonClick }, lang.use('me_attaches_wall_donut_support'))))))),
                isWallDeleted && (React.createElement("div", { className: "AttachWallNew__deleted" },
                    React.createElement(Icon28DeleteOutline, null),
                    text)))),
            isSmall && (React.createElement("div", { className: "AttachWallNew__small" },
                !isDonut && !isWallDeleted && text,
                attaches && (React.createElement("div", { className: "AttachWallNew__small--secondary" }, getAttachmentPreview(wallOrWallReply.attaches, lang))),
                !isUnavailable &&
                    wallOrWallReplyLink &&
                    !isWallDeleted &&
                    !isDonut && (React.createElement("div", { className: "AttachWallNew__linkWrapper" },
                    React.createElement(OpenPostButton, { attach: wallOrWallReply, className: "AttachWallNew__link AttachWallNew__link--post" }, openBtnCaption))),
                isWallDeleted && (React.createElement("div", { className: "AttachWallNew__small--secondary" }, text)),
                isDonut && (React.createElement("div", { className: "AttachWallNew__small--secondary" }, lang.use('me_attaches_wall_donut'))))))));
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
export function getAttachmentPreview(attaches, lang) {
    const attachmentKindsCount = Attach.kindsCount(attaches);
    const attachmentsCount = Attach.count(attaches);
    if (attachmentKindsCount > 1) {
        // X вложений
        return lang.use('me_attaches_attaches', {
            num: attachmentsCount,
        });
    }
    const attach = Object.values(attaches)[0];
    if (attach) {
        return getAttachText(attach, lang);
    }
    return null;
}
//# sourceMappingURL=AttachWallNew.js.map