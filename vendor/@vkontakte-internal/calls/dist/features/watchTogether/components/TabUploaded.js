import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Spinner, Placeholder } from '@vkontakte-internal/vkcom-kit';
import { useOwnerVideos } from '../hooks/useOwnerVideos';
import { EMovieChooseTab } from '../interfaces';
import { SpinnerMaxed } from './SpinnerMaxed';
import { MoviesNotFound } from './MoviesNotFound';
import { MoviesGrid } from './MoviesGrid';
export const TabUploaded = ({ onMovieClick, navigateToProfile }) => {
    const { data, loading, getNextPage, isNextPage } = useOwnerVideos(EMovieChooseTab.Uploaded);
    return (_jsxs(_Fragment, { children: [!data.length && loading && _jsx(SpinnerMaxed, {}), !data.length && !loading && _jsx(MoviesNotFound, {}), !!data.length && (_jsx(MoviesGrid, { onMovieClick: onMovieClick, navigateToProfile: navigateToProfile, isNextPage: isNextPage, getNextPage: getNextPage, movies: data })), !!data.length && loading && (_jsx(Placeholder, { children: _jsx(Spinner, { size: "large" }) }))] }));
};
//# sourceMappingURL=TabUploaded.js.map