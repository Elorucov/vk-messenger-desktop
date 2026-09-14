import '../../ui/AttachWall/AttachWallNew.css';
import '../../ui/AttachChannelMessage/AttachChannelMessage.css';
import React, { useCallback, useEffect, useState } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Peer from '../../../core/model/Peer';
import cx from 'classnames';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { useBrowserEnv, useChannels, useFeatureFlags, useInsertIntoCache, useOwner, usePeers, } from '../../hooks/misc';
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
import { Icon12StarCircleFillYellow, Icon16Advertising, Icon28DonateOutline, } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { AttachStickerPack } from '../../ui/AttachStickerPack/AttachStickerPack';
import { getAttachText } from '../../ui/AttachText/AttachText';
import { AttachMarketAlbum } from '../../ui/AttachMarketAlbum/AttachMarketAlbum';
import { AttachPhotoAlbum } from '../../ui/AttachPhotoAlbum/AttachPhotoAlbum';
import { CodeBlock } from '../../ui/CodeBlock/CodeBlock';
import { AttachWallNew } from '../../ui/AttachWall/AttachWallNew';
import { useApiFetchMany } from '../../hooks/useApiFetch';
import { AttachChannelMessageHeader } from '../../ui/AttachChannelMessage/AttachChannelMessageHeader/AttachChannelMessageHeader';
import { Icon150AvatarPlaceholderSadPersikAlt } from '@vkontakte-internal/icons-private';
import { ChannelLabel } from '../../ui/ChannelLabel/ChannelLabel';
import { useWithoutBubblesTheme } from '../../hooks/useWithoutBubblesTheme';
import { ChannelPostDonutPlaceholder } from '../../ui/ChannelPostDonutPlaceholder/ChannelPostDonutPlaceholder';
export const AttachChannelMessage = ({ peerId, chunks, channelMessage, cmid, forwardLevel = 0, isCompact = false, isInBubble, isThemed = false, isOut, autoplay, onWidthChange, onCloseMessageInModal, getMediaAttachLinkPayload, }) => {
    const owner = useOwner();
    const { lang } = useBrowserEnv();
    const isWithoutBubbleTheme = useWithoutBubblesTheme();
    const peers = usePeers();
    const channels = useChannels();
    const channel = channels.get(channelMessage.channelId);
    const isCacheHasInfoAboutChannel = Boolean(channel);
    const [maxWidth, setMaxWidth] = useState(undefined);
    const { vkm_new_bubbles_width_calc, vkm_channel_donut_redesign } = useFeatureFlags();
    let parentGroupPeer;
    try {
        /** в большой вложенности иногда от бэка не приходят пиры
         * поэтому в fetchProfilesAndGroups запрашиваем их,
         * а пока они не пришли не рисуем блок
         */
        parentGroupPeer =
            channelMessage.parentId &&
                Peer.safeGet(peers, Peer.resolveId(channelMessage.parentId));
    }
    catch {
        parentGroupPeer = Peer.safeGet(peers, Peer.resolveId());
    }
    const { fetchProfilesAndGroups } = useGetMissedPeerAndChannels(channelMessage.channelId, Peer.resolveId(channelMessage.parentId), channelMessage.signerId);
    const [peersCached, setPeersCached] = useState(false);
    useEffect(() => {
        if ((channelMessage.signerId && !peers.has(channelMessage.signerId)) ||
            !isCacheHasInfoAboutChannel) {
            fetchProfilesAndGroups().then(() => setPeersCached(true));
        }
        else {
            setPeersCached(true);
        }
        // Делаем загрузку недостающих пиров при первом рендере
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const isChannelMessageDeleted = channelMessage.kind === 'Normal' && channelMessage.isDeleted;
    const attachProps = {
        isInBubble,
        isOut,
    };
    const attachOwner = channel?.kind === 'Channel' ? channel : undefined;
    const isUnavailable = getIsUnavailable({
        owner,
        attachAuthor: parentGroupPeer,
        attachOwner,
    });
    const stickerSize = isCompact ? 128 : 168;
    const text = (React.createElement("span", { className: "AttachWallNew__message" }, channelMessage.chunks.map((chunk, i) => {
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
                        authorId: parentGroupPeer?.id,
                    }, className: "AttachWallNew__link AttachWallNew__link--text" },
                    chunk.tag,
                    "@",
                    chunk.screenName));
            case 'LineBreak':
                return React.createElement("br", { key: i });
            default:
                return exhaustivenessCheck(chunk);
        }
    })));
    const [useCSSMinContentWidth, setUseCSSMinContentWidth] = useState(false);
    const onMediaWidthChange = (width, ignorePrev) => {
        if (vkm_new_bubbles_width_calc) {
            onWidthChange?.(0, ignorePrev);
            setUseCSSMinContentWidth(true);
            return;
        }
        onWidthChange?.(width, ignorePrev);
        if (width > (maxWidth || 0)) {
            setMaxWidth(width);
        }
    };
    const withAdsBadge = channelMessage.ads.markedAsAds;
    const withDonsBadge = channelMessage.donut?.isDonut && !vkm_channel_donut_redesign;
    const isDonutPlaceholder = Boolean('donut' in channelMessage && channelMessage.donut?.placeholder);
    const withDonMeta = channelMessage.donut?.isDonut &&
        !isDonutPlaceholder &&
        vkm_channel_donut_redesign;
    /**
     * Для публичных видео
     */
    const isPublicVideo = Attach.hasPublicVideo(channelMessage.attaches);
    const vkComLegacyAnalyticsPostId = channelMessage.channelId
        ? `${channelMessage.channelId}_${channelMessage.cmid}`
        : undefined;
    const mediaAttaches = (channelMessage.attaches.photos ||
        channelMessage.attaches.videos ||
        Attach.docsWithPreview(channelMessage.attaches.docs)) && (React.createElement("div", { className: "AttachWallNew__attaches" },
        React.createElement(AttachPhotosVideos, { attaches: channelMessage.attaches, autoplay: autoplay, vkComLegacyAnalyticsPostId: vkComLegacyAnalyticsPostId, attachmentsCount: Attach.count(channelMessage.attaches), onWidthChange: onMediaWidthChange, getAdditionalLinkPayload: getMediaAttachLinkPayload, isThemed: isThemed, isForwarded: false, isInChannel: true, ...attachProps })));
    const attaches = (React.createElement("div", { className: cx('AttachWallNew__attaches', {
            'AttachWallNew__attaches--sticker': channelMessage.attaches.sticker,
        }) },
        channelMessage.attaches.graffiti && (React.createElement(AttachGraffiti, { graffiti: channelMessage.attaches.graffiti, isInBubble: isInBubble, forwardLevel: forwardLevel + 1, onWidthChange: onWidthChange })),
        channelMessage.attaches.curator &&
            channelMessage.attaches.curator.map((curator) => (React.createElement(AttachCurator, { key: `${curator.kind}${curator.id}`, attach: curator, ...attachProps }))),
        channelMessage.attaches.stickerPack && (React.createElement(AttachStickerPack, { attach: channelMessage.attaches.stickerPack, ...attachProps })),
        channelMessage.attaches.link && (React.createElement(AttachLink, { link: channelMessage.attaches.link, ...attachProps })),
        channelMessage.attaches.album && (React.createElement(AttachPhotoAlbum, { album: channelMessage.attaches.album, ...attachProps })),
        channelMessage.attaches.market && (React.createElement(AttachMarket, { market: channelMessage.attaches.market, ...attachProps })),
        channelMessage.attaches.marketAlbum && (React.createElement(AttachMarketAlbum, { marketAlbum: channelMessage.attaches.marketAlbum, ...attachProps })),
        channelMessage.attaches.story && (React.createElement(AttachStory, { story: channelMessage.attaches.story, onWidthChange: onWidthChange })),
        channelMessage.attaches.geo && (React.createElement(AttachGeo, { geo: channelMessage.attaches.geo, onWidthChange: onWidthChange, ...attachProps })),
        channelMessage.attaches.event && (React.createElement(AttachEvent, { event: channelMessage.attaches.event, ...attachProps })),
        channelMessage.attaches.narratives &&
            channelMessage.attaches.narratives.map((narrative) => (React.createElement(AttachNarrative, { key: narrative.id, narrative: narrative, ...attachProps }))),
        Attach.docsWithoutPreview(channelMessage.attaches.docs)?.map((doc) => (React.createElement(AttachDoc, { key: doc.id, doc: doc, forwardLevel: forwardLevel + 1, ...attachProps }))),
        channelMessage.attaches.audios &&
            channelMessage.attaches.audios.map((audio) => (React.createElement(AttachAudio, { audio: audio, key: audio.id, ...attachProps }))),
        channelMessage.attaches.podcast && (React.createElement(AttachAudioPlaylist, { playlist: channelMessage.attaches.podcast, ...attachProps })),
        channelMessage.attaches.audioPlaylists &&
            channelMessage.attaches.audioPlaylists.map((audioPlaylist) => (React.createElement(AttachAudioPlaylistNew, { key: audioPlaylist.id, playlist: audioPlaylist, isInBubble: isInBubble }))),
        channelMessage.attaches.artist && (React.createElement(AttachArtist, { artist: channelMessage.attaches.artist, ...attachProps })),
        channelMessage.attaches.article && (React.createElement(AttachArticle, { article: channelMessage.attaches.article, isCompact: isCompact, isForwarded: true })),
        channelMessage.attaches.miniApps &&
            channelMessage.attaches.miniApps.map((miniApp, index) => (React.createElement(AttachMiniApp, { key: index, miniApp: miniApp, ...attachProps }))),
        channelMessage.attaches.moneyTransfer && (React.createElement(AttachMoneyTransfer, { moneyTransfer: channelMessage.attaches.moneyTransfer, ...attachProps })),
        channelMessage.attaches.donutLink && (React.createElement(AttachDonutLink, { donutLink: channelMessage.attaches.donutLink })),
        channelMessage.attaches.poll && (React.createElement(AttachPoll, { poll: channelMessage.attaches.poll, isCompact: isCompact, forwardLevel: forwardLevel + 1, peerId: peerId, cmid: cmid })),
        channelMessage.attaches.wallHistory && (React.createElement(AttachWallNew, { wallOrWallReply: channelMessage.attaches.wallHistory, peerId: peerId, chunks: channelMessage.attaches.wallHistory.chunks, cmid: cmid, forwardLevel: forwardLevel + 1, isCompact: isCompact, isInBubble: isInBubble, isOut: isOut, isSmall: true, isThemed: isThemed, onWidthChange: onWidthChange, onCloseMessageInModal: onCloseMessageInModal, getMediaAttachLinkPayload: getMediaAttachLinkPayload })),
        channelMessage.attaches.wall && (React.createElement(AttachWallNew, { wallOrWallReply: channelMessage.attaches.wall, peerId: peerId, chunks: channelMessage.attaches.wall.chunks, cmid: cmid, forwardLevel: forwardLevel + 1, isCompact: isCompact, isInBubble: isInBubble, isThemed: isThemed, isOut: isOut, isSmall: true, onWidthChange: onWidthChange, getMediaAttachLinkPayload: getMediaAttachLinkPayload })),
        channelMessage.attaches.sticker && (React.createElement(AttachSticker, { size: stickerSize, sticker: channelMessage.attaches.sticker, commentId: cmid, iconPosition: "rightRelative" }))));
    return (React.createElement("div", { className: cx('AttachWallNew', {
            'AttachWallNew--withMessage': chunks.length,
            //'AttachWallNew--withReply': wallOrWallReply.kind === 'WallReply',
            'AttachWallNew--compact': isCompact,
            'AttachWallNew--themed': isThemed,
        }) },
        React.createElement("div", { className: cx('AttachWallNew__content', {
                'AttachChannelMessage--fitMediaAttachesWidth': useCSSMinContentWidth,
            }), style: { maxWidth: maxWidth } },
            (withAdsBadge || withDonsBadge) && (React.createElement("div", { className: "AttachChannelMessage__badge" },
                withAdsBadge && (React.createElement(ChannelLabel, { withBackdrop: isWithoutBubbleTheme, labelIcon: React.createElement(Icon16Advertising, { width: 12, height: 12 }), text: lang.use('me_channel_ad_mark') })),
                withDonsBadge && (React.createElement(ChannelLabel, { withBackdrop: isWithoutBubbleTheme, labelIcon: React.createElement(Icon12StarCircleFillYellow, null), text: lang.use('me_channel_donut_mark') })))),
            parentGroupPeer && (React.createElement(AttachChannelMessageHeader, { channelMessage: channelMessage, 
                // todo: add restriction check
                peersCached: peersCached, isDonut: isDonutPlaceholder, isChannelMessageDeleted: isChannelMessageDeleted, isUnavailable: isUnavailable, onCloseMessageInModal: onCloseMessageInModal, parentGroupPeer: parentGroupPeer })),
            withDonMeta && (React.createElement("div", { className: "AttachChannelMessage__donateMetaInfo" },
                React.createElement(ChannelLabel, { withBackdrop: isWithoutBubbleTheme, labelIcon: React.createElement(Icon12StarCircleFillYellow, null), text: lang.use('me_channel_donut_mark') }))),
            React.createElement(React.Fragment, null,
                !isPublicVideo && mediaAttaches,
                !isDonutPlaceholder && !isChannelMessageDeleted && text,
                isPublicVideo && mediaAttaches,
                attaches,
                isDonutPlaceholder &&
                    (vkm_channel_donut_redesign ? (React.createElement(ChannelPostDonutPlaceholder, { className: "AttachChannelMessage__donatePlaceholder", paywall: channelMessage.donut?.paywall, placeholder: channelMessage.donut?.placeholder })) : (React.createElement("div", { className: "AttachWallNew__donut" },
                        React.createElement(Icon28DonateOutline, { width: 48, height: 48 }),
                        lang.use('me_attaches_wall_donut'),
                        'donut' in channelMessage &&
                            channelMessage.donut?.placeholder?.button && (React.createElement("div", { className: "AttachWallNew__linkWrapper" },
                            React.createElement("a", { href: channelMessage.donut?.placeholder?.button.action?.url, target: "_blank", rel: "noreferrer" },
                                React.createElement(Button, { className: "AttachDonutLink__button", mode: "primary", appearance: "accent" }, lang.use('me_attaches_wall_donut_support')))))))),
                isChannelMessageDeleted && (React.createElement("div", { className: "AttachWallNew__deleted" },
                    React.createElement(Icon150AvatarPlaceholderSadPersikAlt, { width: 48, height: 48 }),
                    text))))));
};
function getIsUnavailable({ owner, attachAuthor, attachOwner, }) {
    if (owner.id === attachAuthor?.id) {
        return false;
    }
    if (attachOwner && attachOwner.kind === 'Channel') {
        return ((attachOwner.isClosed || attachOwner.isPrivate) &&
            (attachOwner.isMember || attachOwner.isParentGroupMember));
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
export function useGetMissedPeerAndChannels(channelId, parentGroupId, signerId) {
    const { withNewChannels } = useBrowserEnv();
    const insertIntoCache = useInsertIntoCache();
    const apiFetchMany = useApiFetchMany();
    const fetchProfilesAndGroups = useCallback(async () => {
        const [channels, groups, profiles] = await apiFetchMany([
            // не запрашиваем, иначе просто упадет с ошибкой
            withNewChannels && {
                method: 'channels.getById',
                params: { channel_ids: channelId.toString(), extended: 1 },
            },
            parentGroupId &&
                parentGroupId !== 0 && {
                method: 'groups.getById',
                params: {
                    group_ids: Math.abs(parentGroupId).toString(),
                    extended: 1,
                },
            },
            signerId && {
                method: 'users.get',
                params: { user_ids: signerId.toString(), extended: 1 },
            },
        ], { retries: 3 });
        insertIntoCache({
            profiles: profiles || [],
            channels: channels || {},
            groups: groups?.groups || [],
        });
        // insertChannels({
        //     channels: channels || [],
        // })
    }, [
        apiFetchMany,
        channelId,
        insertIntoCache,
        signerId,
        parentGroupId,
        withNewChannels,
    ]);
    return { fetchProfilesAndGroups };
}
//# sourceMappingURL=AttachChannelMessage.js.map