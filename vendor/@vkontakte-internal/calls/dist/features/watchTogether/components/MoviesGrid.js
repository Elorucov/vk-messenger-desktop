import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid } from '@vkontakte-internal/vkcom-kit';
import { NextPageTrigger } from '../../../components/NextPageTrigger/NextPageTrigger';
import { MovieTile } from './MovieTile';
export const MoviesGrid = ({ onMovieClick, movies, isNextPage, getNextPage, navigateToProfile, }) => {
    return (_jsxs(_Fragment, { children: [_jsx(Grid, { columns: 3, columnSpacing: 12, rowSpacing: 22, children: movies.map(({ movie, group, profile }, i) => (_jsx(Grid.Item, { children: _jsx(MovieTile, { movie: movie, group: group, profile: profile, onClick: onMovieClick, navigateToProfile: navigateToProfile }) }, `${movie.owner_id || i}-${movie.id || i}`))) }), isNextPage && _jsx(NextPageTrigger, { onNextPage: getNextPage }, "tiles-load-trigger")] }));
};
//# sourceMappingURL=MoviesGrid.js.map