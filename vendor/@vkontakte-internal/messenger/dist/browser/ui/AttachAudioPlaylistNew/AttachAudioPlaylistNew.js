import React, { useMemo } from 'react';
import * as Peer from '../../../core/model/Peer';
import { Subhead } from '@vkontakte/vkui';
import { UsersStack } from '../../ui/UsersStack/UsersStack';
import { usePixelDensity, useBrowserEnv, usePeers } from '../../hooks/misc';
import { getAudioThumb, mapAudioTrackSourceToPlaylistMetaSource, } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
import { AttachAudioPlaylistPrimary } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistPrimary';
import { ExternalLink, Link } from '../../ui/Link/Link';
import { AttachCard } from '../../ui/AttachCard/AttachCard';
import { AttachText } from '../../ui/AttachText/AttachText';
import { Icon24Playlist } from '@vkontakte/icons';
import { fromApiPicture } from '../../../data/converter/PictureConverter';
export const AttachAudioPlaylistNew = ({ playlist, isInBubble, source, isPrimary = false, isOut = false, isCompact = false, className, onWidthChange, }) => {
    const isDense = usePixelDensity();
    const { router } = useBrowserEnv();
    const href = router.toUrl({ kind: 'AttachProxyRoute', attach: playlist });
    const photoUrl = getPhotoUrl(playlist.photo, isDense, isPrimary);
    return isPrimary && source ? (React.createElement(AttachAudioPlaylistPrimaryWrapper, { source: source, className: className, playlist: playlist, href: href, isDense: isDense, photoUrl: photoUrl, isCompact: isCompact, onWidthChange: onWidthChange })) : (React.createElement(AttachCard, { href: href, title: playlist.title, alt: playlist.title, subtitle: React.createElement(AttachText, { attach: [playlist] }), picture: photoUrl, picturePlaceholder: React.createElement(Icon24Playlist, null), isInBubble: isInBubble, isOut: isOut, className: className }));
};
const AttachAudioPlaylistPrimaryWrapper = ({ playlist, href, photoUrl, isDense, isCompact, source, className, onWidthChange, }) => {
    const { lang, router } = useBrowserEnv();
    const peers = usePeers();
    const audios = useMemo(() => playlist.audios ?? [], [playlist.audios]);
    const playlistMeta = useMemo(() => ({
        type: 'playlist',
        id: playlist.id,
        ownerId: playlist.ownerId,
        source: source && mapAudioTrackSourceToPlaylistMetaSource(source),
        accessKey: playlist.accessKey,
    }), [playlist.id, playlist.ownerId, playlist.accessKey, source]);
    const playlistTitle = useMemo(() => {
        return href ? (React.createElement(ExternalLink, { href: href }, playlist.title)) : (playlist.title);
    }, [href, playlist.title]);
    const playlistAuthor = useMemo(() => {
        const authorPhotoUrls = getAuthorPhotoBaseUrls(playlist, peers);
        return (React.createElement(React.Fragment, null,
            authorPhotoUrls.length > 0 && (React.createElement(UsersStack, { size: 16, count: authorPhotoUrls.length, photos: authorPhotoUrls })),
            React.createElement(Subhead, { className: "AttachAudioPlaylistPrimary__headerAuthorText" }, getAuthorNames(playlist, peers, lang, router))));
    }, [playlist, peers, lang, router]);
    const playlistDescription = useMemo(() => {
        const arr = [lang.use(`me_attach_playlist_type_${playlist.type}_name`)];
        if (playlist.type === 'album' && playlist.year) {
            arr.push(playlist.year.toString());
        }
        if (playlist.type === 'playlist') {
            arr.push(`${playlist.count} ${lang.use('me_attach_playlist_tracks_count', {
                num: playlist.count,
            })}`);
        }
        return arr.join(' · ');
    }, [lang, playlist.type, playlist.year, playlist.count]);
    const playlistFooter = useMemo(() => {
        // Не показываем футер у плейлиста, если нет аудио
        if (!playlist.audios?.length) {
            return;
        }
        const footerItems = [];
        const playsCountFormatter = Intl.NumberFormat('en', { notation: 'compact' });
        // Считаем количество минут только для небольших плейлистов
        const durationMinutes = playlist.audios.length < 20
            ? Math.floor((playlist.audios?.reduce((sum, cur) => sum + cur.duration, 0) ??
                0) / 60)
            : 0;
        if (durationMinutes) {
            footerItems.push(`${durationMinutes} ${lang.use('me_attach_playlist_duration_minutes', {
                num: durationMinutes,
            })}`);
        }
        footerItems.push(`${playsCountFormatter.format(playlist.plays)} ${lang.use('me_attach_playlist_plays_count', {
            // Все что выше тысячи, форматируется в короткое представление – "1K" и тд, поэтому там всегда отображаем "прослушиваний"
            num: Math.min(playlist.plays, 1000),
        })}`);
        return React.createElement(Subhead, null, footerItems.join(' · '));
    }, [lang, playlist.audios, playlist.plays]);
    const attachAudioProps = useMemo(() => ({
        withPhoto: playlist.type !== 'album',
        highlightActiveTrackTitle: playlist.type === 'album',
    }), [playlist.type]);
    return (React.createElement(AttachAudioPlaylistPrimary, { audios: audios, title: playlistTitle, titleText: playlist.title, author: playlistAuthor, description: playlistDescription, footer: playlistFooter, photoUrl: photoUrl, thumbs: playlist.thumbs, isDense: isDense, isCompact: isCompact, attachAudioProps: attachAudioProps, playlistMeta: playlistMeta, source: source, className: className, onWidthChange: onWidthChange }));
};
function getPhotoUrl(photo, isDense, isPrimary) {
    const size = isDense ? 135 : 68;
    const sizePrimary = isDense ? 300 : 135;
    return getAudioThumb(photo, isPrimary ? sizePrimary : size);
}
function getAuthorPhotoBaseUrls(playlist, peers) {
    if (playlist.type === 'playlist') {
        const photo = peers.get(Peer.resolveId(playlist.ownerId))?.photo;
        return photo ? [photo] : [];
    }
    return (playlist.mainArtists
        ?.map(({ photo }) => {
        // Пока что конвертируем в Picture таким образом за неимением поддержки бейзурла
        return fromApiPicture({ baseUrl: photo?.[0]?.url });
    })
        .filter((photo) => photo !== undefined) || []);
}
function getAuthorNames(playlist, peers, lang, router) {
    const artistsLength = (playlist.mainArtists?.length || 0) +
        (playlist.featuredArtists?.length || 0);
    if (artistsLength > 2) {
        return lang.use('me_attach_playlist_collection_artists');
    }
    if (playlist.type === 'playlist') {
        const peer = peers.get(Peer.resolveId(playlist.ownerId));
        if (!peer) {
            return null;
        }
        return (React.createElement(Link, { to: {
                kind: 'PeerPanel',
                peerId: peer.id,
                screenName: Peer.screenName(peer),
            }, className: "PeerInfo__avatar", stopPropagation: false }, Peer.name(peer)));
    }
    const artistMapper = (artist) => {
        const href = router.toUrl({ kind: 'AttachProxyRoute', attach: artist });
        if (!artist.id || !href) {
            return artist.name;
        }
        return (React.createElement(ExternalLink, { href: href, key: artist.name }, artist.name));
    };
    const joinNodes = (array, separator) => {
        return array.reduce((acc, current, index) => {
            if (index > 0) {
                acc.push(separator);
            }
            acc.push(current);
            return acc;
        }, []);
    };
    const mainNames = joinNodes(playlist.mainArtists?.map(artistMapper) ?? [], ' · ');
    const featNames = joinNodes(playlist.featuredArtists?.map(artistMapper) ?? [], ' · ');
    return featNames.length ? [...mainNames, ' feat. ', ...featNames] : mainNames;
}
//# sourceMappingURL=AttachAudioPlaylistNew.js.map