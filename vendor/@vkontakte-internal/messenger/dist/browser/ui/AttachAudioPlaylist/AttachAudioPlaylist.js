import { Icon24Playlist } from '@vkontakte/icons';
import React from 'react';
import { usePixelDensity, useBrowserEnv } from '../../hooks/misc';
import { AttachCard } from '../../ui/AttachCard/AttachCard';
import { AttachText } from '../../ui/AttachText/AttachText';
import { getAudioThumb } from '../../env/AudioPlayer/ConvoAudiosPlaylist';
/**
 * После раскатки vkm_new_attach_playlist
 * Этот компонент должен быть заменен на AttachAudioPlaylistNew
 */
export const AttachAudioPlaylist = ({ playlist, isInBubble, isOut, }) => {
    const isDense = usePixelDensity();
    const { router } = useBrowserEnv();
    const [defaultPreview, normalPreview, hiresPreview] = (playlist.kind === 'AudioPlaylist'
        ? [
            getAudioThumb(playlist.photo),
            getAudioThumb(playlist.photo, 68),
            getAudioThumb(playlist.photo, 135),
        ]
        : playlist.image?.map((image) => image.url)) || [];
    const previewUrl = (isDense ? hiresPreview : normalPreview) || defaultPreview;
    return (React.createElement(AttachCard, { href: router.toUrl({ kind: 'AttachProxyRoute', attach: playlist }), title: playlist.title, alt: playlist.title, subtitle: React.createElement(AttachText, { attach: playlist.kind === 'AudioPlaylist' ? [playlist] : playlist }), picture: previewUrl, picturePlaceholder: React.createElement(Icon24Playlist, null), isInBubble: isInBubble, isOut: isOut }));
};
//# sourceMappingURL=AttachAudioPlaylist.js.map