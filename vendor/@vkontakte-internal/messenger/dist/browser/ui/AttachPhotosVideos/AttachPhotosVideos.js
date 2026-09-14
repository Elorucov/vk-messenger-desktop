import '../../ui/AttachPhotosVideos/AttachPhotosVideos.css';
import React, { useEffect, useState } from 'react';
import * as Attach from '../../../core/model/Attach';
import * as Message from '../../../core/model/Message';
import cx from 'classnames';
import { Icon16Verified, Icon24Play } from '@vkontakte/icons';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { applySizeLimitations, getAttachForwardIndent, } from '../../utils/misc';
import { useImagesLayout } from '../../ui/ConvoHistory/ImagesLayoutContext';
import { PhotoItem } from '../../ui/PhotoItem/PhotoItem';
import { AttachVideosClip } from '../../ui/AttachVideosClip/AttachVideosClip';
import * as Peer from '../../../core/model/Peer';
import { useBrowserEnv, useFeatureFlags, usePeers } from '../../hooks/misc';
import { Subhead } from '@vkontakte/vkui';
import { IconLiveText20h } from '@vkontakte-internal/icons-private';
import { ConvoMessageBottomInfo } from '../../ui/ConvoMessageBottomInfo/ConvoMessageBottomInfo';
import { useConvoAttachesGetMissedPeers } from '../../hooks/useConvoAttaches';
import { AttachesGrid } from '../../ui/AttachesGrid/AttachesGrid';
import { AttachDocPreview } from '../../ui/AttachDocPreview/AttachDocPreview';
import { AttachVideoInlinePlayer } from '../../ui/AttachVideoInlinePlayer/AttachVideoInlinePlayer';
import { getVideoAuthorLink, getVideoDuration } from '../../utils/attach';
import { AttachRestriction } from '../../ui/AttachRestriction/AttachRestriction';
import { AttachChannelStubPhotoVideo } from '../../ui/AttachChannelStub/AttachChannelStubPhotoVideo';
import { CLIP_HEIGHT_COMPACT, CLIP_HEIGHT_FULL, CLIP_WIDTH_COMPACT, CLIP_WIDTH_FULL, MIN_SINGLE_IMAGE_HEIGHT, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_VIDEO_HEIGHT, MIN_SINGLE_VIDEO_WIDTH, NEW_CLIP_HEIGHT_COMPACT, NEW_CLIP_HEIGHT_FULL, NEW_CLIP_WIDTH_COMPACT, } from '../../hooks/useExpectedAttachesWidth';
const IMAGE_COVER_FACTOR = 3;
/**
 * Боты, которые генерируют графики, загружают фото не через API, а напрямую в storage2
 * У таких фото нет id (0)
 */
const UNDEFINED_PHOTO_ID = 0;
/**
 * Компонент для отображения всех видеозаписей из аттачей сообщения
 */
export const AttachPhotosVideos = ({ attaches, isCompact = false, forwardLevel = 0, attachmentsCount, showDateOutInsidePublicVideo, isUnread, forceAutoPlay, message, withSwipeNavigation, isInBubble, hidePublicVideoInfo, vkComLegacyAnalyticsPostId, autoplay, isThemed, isClipOnly, isForwarded, isInChannel, onPlayed, getAdditionalLinkPayload, onWidthChange, openClipCoOwnersModal, }) => {
    const featureFlags = useFeatureFlags();
    const forwardIndent = getAttachForwardIndent(forwardLevel, featureFlags.vkm_new_forward);
    const { router } = useBrowserEnv();
    const { width, maxSingleHeight } = useImagesLayout();
    const videos = attaches.videos ?? [];
    const photos = attaches.photos ?? [];
    const docs = attaches.docs ?? [];
    const commonLayoutWidth = width - forwardIndent;
    const isTheOnlyAttach = photos.length + docs.length + videos.length === 1;
    const peers = usePeers();
    const requiredIds = videos
        .filter((video) => !peers.has(Peer.resolveId(video.ownerId)))
        .map((video) => Peer.resolveId(video.ownerId));
    const { fetchProfilesAndGroups } = useConvoAttachesGetMissedPeers(requiredIds);
    useEffect(() => {
        fetchProfilesAndGroups();
        // Делаем загрузку недостающих пиров при первом рендере
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const isPublicVideo = Attach.hasPublicVideo(attaches);
    return (React.createElement(AttachesGrid, { forwardLevel: forwardLevel, onWidthChange: onWidthChange, withBorders: featureFlags.vkm_new_forward && !isPublicVideo && !isClipOnly, withBottomBorderRadius: featureFlags.vkm_new_forward ? !isPublicVideo : true }, photos
        .map((photo) => {
        // Нужно получить хоть какие-то начальные размеры.
        // Берём те, что подходят для отображения фотки как единственной во вложении.
        // Далее отталкиваемся от этих значений.
        const preview = Attach.preview(photo, commonLayoutWidth);
        if (!preview) {
            return null;
        }
        const { width, height } = applySizeLimitations(preview.width, preview.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT);
        const photosWithSwipeNavigation = withSwipeNavigation ?? true;
        return (React.createElement(AttachPhotoItem, { key: photo.id, src: preview.url, width: width, height: height, previewWidth: preview.width, previewHeight: preview.height, photo: photo, getAdditionalLinkPayload: getAdditionalLinkPayload, photos: forwardLevel ||
                isForwarded ||
                (isInChannel && featureFlags.vkm_channels_post_photo_attach)
                ? photos
                : undefined, position: photo.id === UNDEFINED_PHOTO_ID || photosWithSwipeNavigation
                ? photo.position
                : 0, total: photos.length, restriction: photo.restriction, isSingleAttach: isTheOnlyAttach }));
    })
        .concat(featureFlags.vkm_channel_stub_attach && attaches.channelStubPhoto
        ? attaches.channelStubPhoto.map((channelStubPhoto, index) => {
            const { width, height } = applySizeLimitations(channelStubPhoto.width, channelStubPhoto.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT);
            return (React.createElement(AttachChannelStubPhotoVideo, { key: `AttachChannelStubPhoto-${index}`, width: width, height: height }));
        })
        : null)
        .concat(docs.map((doc) => {
        const preview = Attach.preview(doc, commonLayoutWidth);
        if (!preview) {
            return null;
        }
        const { width, height } = applySizeLimitations(preview.width, preview.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT);
        return (React.createElement(AttachDocPreview, { key: doc.id, doc: doc, width: width, height: height, isInBubble: isInBubble, forwardLevel: forwardLevel, isTheOnlyAttach: isTheOnlyAttach }));
    }))
        .concat(featureFlags.vkm_channel_stub_attach && attaches.channelStubDoc
        ? attaches.channelStubDoc.map((channelStubDoc, index) => {
            if (!channelStubDoc.height || !channelStubDoc.width) {
                return null;
            }
            const { width, height } = applySizeLimitations(channelStubDoc.width, channelStubDoc.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT);
            return (React.createElement(AttachChannelStubPhotoVideo, { key: `AttachChannelStubDoc-${index}`, width: width, height: height, ext: channelStubDoc.ext, size: channelStubDoc.size }));
        })
        : null)
        .concat(videos.map((videoAttach) => {
        const preview = Attach.preview(videoAttach, commonLayoutWidth);
        if (!preview) {
            return null;
        }
        const { url } = preview;
        let { width, height } = preview;
        const { id, duration, platform, files, restriction } = videoAttach;
        if (videoAttach.type === 'short_video') {
            width = isCompact
                ? featureFlags.vkm_clip_uniform_size
                    ? NEW_CLIP_WIDTH_COMPACT
                    : CLIP_WIDTH_COMPACT
                : CLIP_WIDTH_FULL;
            height = isCompact
                ? featureFlags.vkm_clip_uniform_size
                    ? NEW_CLIP_HEIGHT_COMPACT
                    : CLIP_HEIGHT_COMPACT
                : featureFlags.vkm_clip_uniform_size
                    ? NEW_CLIP_HEIGHT_FULL
                    : CLIP_HEIGHT_FULL;
        }
        else {
            const { width: _width, height: _height } = applySizeLimitations(width, height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_VIDEO_WIDTH, MIN_SINGLE_VIDEO_HEIGHT);
            width = _width;
            height = _height;
        }
        const isMarkedPlayed = message?.kind === 'Normal' &&
            message?.isPlayed &&
            !message?.isOut &&
            !isCompact;
        const position = withSwipeNavigation
            ? getVideoMediaViewerPosition(videoAttach)
            : 0;
        const setMarkAsPlayed = () => {
            if (message?.kind === 'Normal') {
                onPlayed?.(message);
            }
        };
        const openClipRecommendations = () => {
            router.push({
                kind: 'AttachMediaProxyRoute',
                attach: videoAttach,
                source: getAdditionalLinkPayload?.({
                    mediaViewerItemPosition: position,
                    showRecommendations: true,
                }),
            });
        };
        return (React.createElement(AttachVideoItem, { key: id, src: url, width: width, height: height, video: videoAttach, showPlayIcon: videos.length <= 3, duration: duration, platform: platform, files: files, restriction: restriction, attachmentsCount: attachmentsCount, forceAutoPlay: forceAutoPlay, isTheOnlyAttach: isTheOnlyAttach, isUnread: isUnread, message: message, autoplay: autoplay, vkComLegacyAnalyticsPostId: vkComLegacyAnalyticsPostId, showDateOutInsidePublicVideo: showDateOutInsidePublicVideo, position: position, hidePublicVideoInfo: hidePublicVideoInfo, getAdditionalLinkPayload: getAdditionalLinkPayload, isThemed: isThemed, withDisabledInlinePlayer: videoAttach.type === 'short_video' &&
                featureFlags.vkm_no_clip_playing_in_history, openClipCoOwnersModal: openClipCoOwnersModal, setMarkAsPlayed: setMarkAsPlayed, openClipRecommendations: openClipRecommendations, isMarkedPlayed: isMarkedPlayed }));
    }))
        .concat(featureFlags.vkm_channel_stub_attach && attaches.channelStubVideo
        ? attaches.channelStubVideo.map((channelStubVideo, index) => {
            const { width, height } = applySizeLimitations(channelStubVideo.width, channelStubVideo.height, commonLayoutWidth, maxSingleHeight, MIN_SINGLE_IMAGE_WIDTH, MIN_SINGLE_IMAGE_HEIGHT);
            return (React.createElement(AttachChannelStubPhotoVideo, { key: `AttachChannelStubVideo-${index}`, width: width, height: height }));
        })
        : null)
        .filter((attach) => Boolean(attach))));
};
const AttachVideoItem = ({ src, width, height, video, duration, restriction, files, autoplay, vkComLegacyAnalyticsPostId, platform, showPlayIcon, attachmentsCount, forceAutoPlay, isTheOnlyAttach, showDateOutInsidePublicVideo, isUnread, message, position, hidePublicVideoInfo, className, getAdditionalLinkPayload, isThemed = false, withDisabledInlinePlayer = false, openClipCoOwnersModal, openClipRecommendations, setMarkAsPlayed, isMarkedPlayed, }) => {
    const peers = usePeers();
    const { lang, vkDomain } = useBrowserEnv();
    const canPlay = restriction?.canPlay ?? true;
    const info = getVideoDuration(duration, !!files?.external) || platform;
    const repostVideo = attachmentsCount === 1 &&
        !video.isFromMessage &&
        video.platform === undefined &&
        video.type !== 'short_video' &&
        video;
    const externalSoloVideo = attachmentsCount === 1 && video.platform !== undefined && video;
    let publicVideoAuthor = undefined;
    if (repostVideo !== false &&
        isTheOnlyAttach &&
        peers.has(Peer.resolveId(repostVideo.ownerId))) {
        publicVideoAuthor = Peer.safeGet(peers, Peer.resolveId(repostVideo.ownerId));
    }
    const formattedDate = repostVideo !== false &&
        getFormattedUpdatedTime(repostVideo.uploadDate, lang);
    const hasRestriction = Boolean(restriction);
    const renderAttach = () => {
        if (restriction) {
            return (React.createElement(AttachRestriction, { restriction: restriction, width: width, height: height, backgroundImage: src, small: !isTheOnlyAttach }));
        }
        if (video.type === 'short_video') {
            return (React.createElement(AttachVideosClip, { ownerId: video.ownerId, height: height, width: width, clip: video, previewUrl: src, isMarkedPlayed: isMarkedPlayed, openClipRecommendations: openClipRecommendations, openCoOwnersModal: openClipCoOwnersModal }));
        }
        return (React.createElement(React.Fragment, null,
            React.createElement(PhotoItem, { width: width, height: height, src: src, alt: video.title, widthAndHeightAsAttr: Boolean(repostVideo), className: className }),
            !hasRestriction && (React.createElement(React.Fragment, null,
                showPlayIcon && (React.createElement("div", { className: "AttachVideos__videoPlay" },
                    React.createElement(Icon24Play, null))),
                info && video.type !== 'live' && (React.createElement("div", { className: "AttachVideos__videoInfo" }, info)),
                video.type === 'live' && (React.createElement("div", { className: "AttachVideos__videoLive" },
                    React.createElement(IconLiveText20h, { className: "AttachVideos__videoLive--icon" })))))));
    };
    const renderInlinePlayer = (children) => {
        return withDisabledInlinePlayer ? (children) : (React.createElement(AttachVideoInlinePlayer, { autoplay: autoplay, forceAutoPlay: forceAutoPlay, attachmentsCount: attachmentsCount, vkComLegacyAnalyticsPostId: vkComLegacyAnalyticsPostId, hasRestriction: hasRestriction, isVkVideo: !video.platform, videoId: `${video.ownerId}_${video.id}`, listId: video.accessKey || '', shortVideo: video.type === 'short_video', peerId: message?.kind === 'Foreign' ? message.rootPeerId : message?.peerId, cmid: message?.cmid ? Message.getCmid(message) : undefined }, children));
    };
    return (React.createElement("div", { className: cx('AttachVideos__base', {
            'AttachVideos__base--withFooter': (repostVideo && publicVideoAuthor) || externalSoloVideo,
            'AttachVideos__base--themed': isThemed,
        }) },
        renderInlinePlayer(React.createElement(Link, { onNavigate: setMarkAsPlayed, to: {
                kind: 'AttachMediaProxyRoute',
                attach: video,
                source: getAdditionalLinkPayload?.({
                    mediaViewerItemPosition: position,
                }),
            }, className: "AttachVideos__link", disabled: !canPlay }, renderAttach())),
        repostVideo && publicVideoAuthor && !hidePublicVideoInfo && (React.createElement("div", { className: "AttachVideos__info", style: { maxWidth: width } },
            React.createElement(Subhead, { className: "AttachVideos__videoName", Component: "p" },
                React.createElement(Link, { to: {
                        kind: 'AttachMediaProxyRoute',
                        attach: video,
                        source: getAdditionalLinkPayload?.({
                            mediaViewerItemPosition: position,
                        }),
                    }, className: "AttachVideos__videoName--link", disabled: !canPlay }, repostVideo.title)),
            React.createElement("div", { className: "AttachVideos__authorName" },
                video.mainArtists &&
                    video.mainArtists.map((artist, index, array) => {
                        const delimiter = index < array.length - 1 && (React.createElement("span", null, ",\u00A0"));
                        if (!artist.domain) {
                            return (React.createElement("span", { className: "AttachVideos__authorLink AttachVideos__artistLink" },
                                artist.name,
                                delimiter));
                        }
                        return (React.createElement(ExternalLink, { href: `https://${vkDomain}/artist/${artist.domain}`, className: "AttachVideos__authorLink AttachVideos__artistLink" },
                            React.createElement("span", null, artist.name),
                            delimiter));
                    }),
                !video.mainArtists && (React.createElement(ExternalLink, { href: getVideoAuthorLink(vkDomain, repostVideo.type, publicVideoAuthor), className: "AttachVideos__authorLink" },
                    React.createElement("span", null, Peer.name(publicVideoAuthor)),
                    'isVerified' in publicVideoAuthor &&
                        publicVideoAuthor.isVerified && (React.createElement("span", null,
                        React.createElement(Icon16Verified, { className: "AttachVideos__authorVerified" })))))),
            canPlay && (React.createElement("div", { className: "AttachVideos__views" },
                lang.use('me_convo_attaches_video_views', {
                    num: repostVideo.views,
                    formatted: 'short',
                    values: {
                        count: lang.formatNumber(repostVideo.views, 'short'),
                    },
                }),
                formattedDate && React.createElement(React.Fragment, null,
                    " \u00B7 ",
                    formattedDate),
                showDateOutInsidePublicVideo &&
                    message?.kind === 'Normal' &&
                    isUnread !== undefined && (React.createElement(ConvoMessageBottomInfo, { className: "ConvoMessage__info AttachVideos__bottomInfo", dateClassName: "ConvoMessage__date", message: message, isUnread: isUnread, showDate: true })))))),
        externalSoloVideo && !hidePublicVideoInfo && (React.createElement("div", { className: "AttachVideos__info", style: { maxWidth: width } },
            React.createElement(Subhead, { className: "AttachVideos__videoName AttachVideos__videoName--external", Component: "p" },
                React.createElement(Link, { to: {
                        kind: 'AttachMediaProxyRoute',
                        attach: video,
                        source: getAdditionalLinkPayload?.({
                            mediaViewerItemPosition: position,
                        }),
                    }, className: "AttachVideos__videoName--link", disabled: !canPlay }, externalSoloVideo.title)),
            React.createElement("div", { className: "AttachVideos__views" },
                React.createElement(ExternalLink, { href: externalSoloVideo.files?.external || '', className: "AttachVideos__authorLink" },
                    externalSoloVideo.platform,
                    showDateOutInsidePublicVideo &&
                        message?.kind === 'Normal' &&
                        isUnread !== undefined && (React.createElement(ConvoMessageBottomInfo, { className: "ConvoMessage__info ConvoMessage__info--external AttachVideos__bottomInfo", dateClassName: "ConvoMessage__date", message: message, isUnread: isUnread, showDate: true }))))))));
};
const AttachPhotoItem = ({ src, width: containerWidth, height: containerHeight, previewHeight, previewWidth, photo, total, position, className, restriction, isSingleAttach, getAdditionalLinkPayload, photos, }) => {
    const [hasError, setHasError] = useState(false);
    const isCovered = shouldCoverImage(containerWidth, containerHeight, previewWidth, previewHeight);
    const canOpen = !restriction || restriction.canPlay || restriction.isBlur;
    return (React.createElement(Link, { disabled: hasError || !canOpen, to: {
            kind: 'AttachMediaProxyRoute',
            attach: photo,
            source: getAdditionalLinkPayload?.({
                mediaViewerItemPosition: position,
            }),
            vkcomIntegrationAdditionalParam: photos,
        }, className: "AttachPhotos__link" }, restriction ? (React.createElement(AttachRestriction, { restriction: restriction, backgroundImage: src, width: containerWidth, height: containerHeight, small: !isSingleAttach })) : (React.createElement(PhotoItem, { height: containerHeight, width: containerWidth, cover: isCovered, src: src, thumbhashUrl: photo.thumbhashUrl, showReload: true, className: className, onError: () => setHasError(true), onLoad: () => setHasError(false), itemPosition: position, totalItems: total }))));
};
function shouldCoverImage(containerWidth, containerHeight, previewWidth, previewHeight) {
    if (previewWidth < containerWidth && previewHeight < containerHeight) {
        return false;
    }
    const imageRatio = previewWidth / previewHeight;
    const containerRatio = containerWidth / containerHeight;
    const ratio = imageRatio / containerRatio;
    return ratio < IMAGE_COVER_FACTOR && ratio > 1 / IMAGE_COVER_FACTOR;
}
function getVideoMediaViewerPosition(video) {
    // Для клипов 'short_video' и публичных или внешних видео не поддерживаем сквозной просмотр
    return video.type === 'short_video' ||
        !video.isFromMessage ||
        video.files?.external
        ? undefined
        : video.position;
}
function getFormattedUpdatedTime(timestamp, lang) {
    if (!timestamp) {
        return '';
    }
    const timeNow = Date.now() / 1000;
    const diff = timeNow - timestamp / 1000;
    if (diff < 60) {
        return lang.use('me_video_added_less_than_a_minute_ago');
    }
    if (diff < 3600) {
        return lang.use('me_video_mins_ago', {
            num: Math.floor(diff / 60),
        });
    }
    if (diff < 24 * 3600) {
        return lang.use('me_video_hours_ago', {
            num: Math.floor(diff / 3600),
        });
    }
    if (diff < 30 * 24 * 3600) {
        return lang.use('me_video_days_ago', {
            num: Math.floor(diff / (24 * 3600)),
        });
    }
    if (diff < 365 * 24 * 3600) {
        return lang.use('me_video_months_ago', {
            num: Math.floor(diff / (30 * 24 * 3600)),
        });
    }
    return lang.use('me_video_years_ago', {
        num: Math.floor(diff / (363 * 24 * 3600)),
    });
}
//# sourceMappingURL=AttachPhotosVideos.js.map