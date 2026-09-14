import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { VideoPlaylistCard } from '@vkontakte-internal/vkcom-kit';
import { getMovieBackgroundUrl } from '../utils';
import { TARGET_SIZE } from '../constants';
const EMPTY_OWNER = { name: '', href: '' };
const mapAlbumToItem = (album) => {
    const url = getMovieBackgroundUrl({
        targetSize: TARGET_SIZE,
        image: album.image,
    });
    return {
        id: album.id,
        title: album.title,
        count: album.count,
        thumbSrc: url,
    };
};
/** карточка плейлиста в списке-гриде */
const AlbumTileComponent = ({ album, onClick }) => {
    const onAlbumTileClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        onClick?.(album);
    };
    return (
    // eslint-disable-next-line @vkontakte-internal/vkcom-plugins/check-required-props-usage
    _jsx(VideoPlaylistCard, { item: { ...mapAlbumToItem(album), owner: EMPTY_OWNER }, onClick: onAlbumTileClick, noAvatar: true, ownerVisibilityMode: "hidden" }));
};
export const AlbumTile = memo(AlbumTileComponent);
//# sourceMappingURL=AlbumTile.js.map