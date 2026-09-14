import { EMovieSort, EMovieLength } from '../../components/SearchBar/interfaces';
export const TARGET_SIZE = { w: 514, h: 288 }; // размер превьюхи мувика
export const DEFAULT_COUNT = 12; // количество отображаемых блоков с мувиками
export const SORT_MAP = {
    [EMovieSort.Date]: 0,
    [EMovieSort.Length]: 1,
    [EMovieSort.Relevance]: 2,
};
export const FILTERS_MAP = {
    [EMovieLength.Any]: undefined,
    [EMovieLength.Long]: 'long',
    [EMovieLength.Short]: 'short',
};
//# sourceMappingURL=constants.js.map