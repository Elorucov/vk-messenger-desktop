import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}],"span":["global",{"className":1}]} */
import { Spinner, Placeholder } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { NextPageTrigger } from '../../../components/NextPageTrigger/NextPageTrigger';
import { MovieTile } from './MovieTile';
import { SpinnerMaxed } from './SpinnerMaxed';
import { MoviesNotFound } from './MoviesNotFound';
export const SearchResults = ({ moviesData, loading, getNextPage, count, query, onMovieClick, navigateToProfile, }) => {
    const { getLang } = useLang();
    const isNotFound = moviesData && !moviesData.length && !loading;
    const isSpinnerMax = !moviesData && loading;
    const isLoadingMore = moviesData && !!moviesData.length && loading;
    return (_jsxs(_Fragment, { children: [isSpinnerMax && _jsx(SpinnerMaxed, {}), isNotFound && _jsx(MoviesNotFound, { query: query }), !!moviesData?.length && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "CallsMovieSearchTitle", children: [_jsx("span", { children: getLang('calls_movie_player_search') }), !!count && _jsxs("span", { className: "CallsMovieSearchTitle__count", children: [" ", count] })] }), _jsxs("div", { className: "CallsMovieTiles", children: [moviesData.map(({ movie, group, profile }, i) => (_jsx(MovieTile, { movie: movie, group: group, profile: profile, onClick: onMovieClick, navigateToProfile: navigateToProfile }, `${movie.owner_id || i}-${movie.id || i}`))), moviesData.length < count && (_jsx(NextPageTrigger, { onNextPage: getNextPage }, "tiles-load-trigger"))] })] })), isLoadingMore && (_jsx(Placeholder, { children: _jsx(Spinner, { size: "large" }) }))] }));
};
//# sourceMappingURL=SearchResults.js.map