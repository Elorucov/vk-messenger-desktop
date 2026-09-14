import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { useCallback, useEffect, useMemo } from 'react';
import { Spinner, Placeholder } from '@vkontakte-internal/vkcom-kit';
import { NextPageTrigger } from '../../../components/NextPageTrigger/NextPageTrigger';
import { SpinnerMaxed } from './SpinnerMaxed';
import { useAlbums } from '../hooks/useAlbums';
import { AlbumsNotFound } from './AlbumsNotFound';
import { AlbumTile } from './AlbumTile';
export const TabAlbums = ({ onAlbumClick }) => {
    const { data, loading, getNextPage, isNextPage } = useAlbums();
    const ac = useMemo(() => new AbortController(), []);
    const handleNextPage = useCallback(() => {
        return getNextPage(ac.signal);
    }, [ac]);
    useEffect(() => {
        return () => ac.abort();
    }, [ac]);
    return (_jsxs(_Fragment, { children: [!data.length && loading && _jsx(SpinnerMaxed, { isAlbums: true }), !data.length && !loading && _jsx(AlbumsNotFound, {}), !!data.length && (_jsxs("div", { className: "CallsMovieTiles", children: [data.map((album, i) => (_jsx(AlbumTile, { album: album, onClick: onAlbumClick }, `${album.owner_id || i}-${album.id || i}`))), isNextPage && _jsx(NextPageTrigger, { onNextPage: handleNextPage }, "tiles-load-trigger")] })), !!data.length && loading && (_jsx(Placeholder, { children: _jsx(Spinner, { size: "large" }) }))] }));
};
//# sourceMappingURL=TabAlbums.js.map