import React, { useMemo } from 'react';
import { useBrowserEnv, useOwner, usePixelDensity } from '../../hooks/misc';
import { Icon24Playlist } from '@vkontakte/icons';
import { AttachCard } from '../../ui/AttachCard/AttachCard';
import { AttachText } from '../../ui/AttachText/AttachText';
import { AttachAudioPlaylistPrimary } from '../../ui/AttachAudioPlaylistNew/AttachAudioPlaylistPrimary';
import { ExternalLink } from '../../ui/Link/Link';
import { mapAudioTrackSourceToPlaylistMetaSource } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
export const AttachArtist = ({ source, artist, isInBubble, isPrimary = false, isOut = false, isCompact = false, onWidthChange, }) => {
    const { router } = useBrowserEnv();
    const isDense = usePixelDensity();
    const href = router.toUrl({ kind: 'AttachProxyRoute', attach: artist });
    const photoUrl = getPhotoUrl(artist.photo, isDense, isPrimary);
    return isPrimary ? (React.createElement(AttachArtistPrimary, { source: source, artist: artist, href: href, photoUrl: photoUrl, isDense: isDense, isCompact: isCompact, onWidthChange: onWidthChange })) : (React.createElement(AttachCard, { href: href, title: artist.name, alt: artist.name, subtitle: React.createElement(AttachText, { attach: artist }), picture: photoUrl, picturePlaceholder: React.createElement(Icon24Playlist, null), isInBubble: isInBubble, isOut: isOut }));
};
const AttachArtistPrimary = ({ artist, href, photoUrl, isDense, isCompact, source, onWidthChange }) => {
    const { lang } = useBrowserEnv();
    const { id: ownerId } = useOwner();
    const playlistMeta = useMemo(() => {
        return {
            type: 'artist',
            blockId: artist.blockId ?? '',
            ownerId, // У плейлиста артиста ownerId – текущий юзер
            source: source && mapAudioTrackSourceToPlaylistMetaSource(source),
        };
    }, [ownerId, artist.blockId, source]);
    const audios = useMemo(() => artist.audios ?? [], [artist.audios]);
    const title = useMemo(() => {
        return href ? (React.createElement(ExternalLink, { href: href }, artist.name)) : (artist.name);
    }, [href, artist.name]);
    const description = lang.use('me_attach_artist_description');
    return (React.createElement(AttachAudioPlaylistPrimary, { source: source, audios: audios, title: title, titleText: artist.name, description: description, photoUrl: photoUrl, isDense: isDense, isCompact: isCompact, playlistMeta: playlistMeta, circlePhoto: true, onWidthChange: onWidthChange }));
};
function getPhotoUrl(photo, isDense, isPrimary) {
    if (!photo) {
        return undefined;
    }
    const size = isDense ? 135 : 68;
    const sizePrimary = isDense ? 270 : 135;
    const sizeValue = isPrimary ? sizePrimary : size;
    return (photo.find((item) => item.width >= sizeValue)?.url ??
        photo[photo.length - 1]?.url);
}
//# sourceMappingURL=AttachArtist.js.map