import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo } from 'react';
import { Spinner, Placeholder } from '@vkontakte-internal/vkcom-kit';
import { SpinnerMaxed } from './SpinnerMaxed';
import { useAlbumVideos } from '../hooks/useAlbumVideos';
import { AlbumMoviesEmpty } from './AlbumMoviesEmpty';
import { MoviesGrid } from './MoviesGrid';
export const TabAlbumVideos = ({ albumId, onMovieClick, navigateToProfile, }) => {
    const { data, loading, getNextPage, isNextPage } = useAlbumVideos(albumId);
    const ac = useMemo(() => new AbortController(), []);
    const handleNextPage = useCallback(() => {
        return getNextPage(ac.signal);
    }, [ac]);
    useEffect(() => {
        return () => ac.abort();
    }, [ac]);
    return (_jsxs(_Fragment, { children: [!data.length && loading && _jsx(SpinnerMaxed, {}), !data.length && !loading && _jsx(AlbumMoviesEmpty, {}), !!data.length && (_jsx(MoviesGrid, { onMovieClick: onMovieClick, navigateToProfile: navigateToProfile, isNextPage: isNextPage, getNextPage: handleNextPage, movies: data })), !!data.length && loading && (_jsx(Placeholder, { children: _jsx(Spinner, { size: "large" }) }))] }));
};
//# sourceMappingURL=TabAlbumVideos.js.map