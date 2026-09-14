import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":3}]} */
import { useEffect, useState } from 'react';
import { createWidget } from '@vkontakte-internal/di';
import { TextClamp, Title } from '@vkontakte-internal/vkcom-kit';
import { observer } from 'mobx-react-lite';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { useSearchSettings } from '../../components/SearchBar/hooks/useSearchSettings';
import { useSearch } from '../../components/SearchBar/hooks/useSearch';
import { useCloseModal } from '../../hooks/useCloseModal';
import { useLocale, useNavigationContext } from '@vkontakte-internal/calls-core';
import { MovieChooseModal } from './components/MovieChooseModal';
import { useTabs } from './hooks/useTabs';
import { TabAdded } from './components/TabAdded';
import { TabAlbums } from './components/TabAlbums';
import { TabRecommended } from './components/TabRecommended';
import { TabAlbumVideos } from './components/TabAlbumVideos';
import { TabUploaded } from './components/TabUploaded';
import { useSearchVideos } from './hooks/useSearchVideos';
import { SearchResults } from './components/SearchResults';
import { CurrentSharedMovie } from './components/CurrentSharedMovie';
import { EMovieChooseTab } from './interfaces';
import { RemoveMovieModal } from './components/RemoveMovieModal';
import { MoviesPageTabs } from './components/MoviesPageTabs';
import { Provider, useModel } from './MovieChooseModel';
const MovieChooseComponent = observer(function MovieChooseComponent() {
    const { movieInfo, isShowRemoveModal, setIsShowRemoveModal, handleRemoveMovie, handleStopAndPlayNewMovie, handleMovieClick, isRemoveAvailable, } = useModel();
    const { locale } = useLocale();
    const { navigateToProfile } = useNavigationContext();
    const onCloseModal = useCloseModal();
    const { onTabClick, tab, tabs } = useTabs();
    const searchSettings = useSearchSettings();
    const searchVideos = useSearchVideos({
        searchSettings: searchSettings.settings,
    });
    const searchText = useSearch({
        onSearchMovies: searchVideos.getSearchMovies,
    });
    const [chosenAlbum, setChosenAlbum] = useState(null);
    /** коллбек при клике на выбранный мувик */
    const onMovieClick = (movie) => {
        handleMovieClick(movie, locale);
    };
    /** коллбек при клике на выбранный плейлист */
    const handleAlbumClick = (album) => {
        setChosenAlbum(album);
    };
    useEffect(() => {
        if (chosenAlbum && !!searchText.text.length) {
            setChosenAlbum(null);
        }
    }, [chosenAlbum, searchText.text]);
    const isSearching = !!searchText.text.length;
    const onRemoveMovieConfirm = () => {
        handleStopAndPlayNewMovie(locale);
    };
    return (_jsxs(MovieChooseModal, { isAlbumChosen: Boolean(chosenAlbum), resetAlbumChosen: () => setChosenAlbum(null), children: [_jsx("div", { className: "CallsMovieChooseSearchContent", children: _jsx(SearchBar, { ...searchSettings, ...searchText, loading: searchVideos.loading }) }), movieInfo && !isSearching && (_jsx(CurrentSharedMovie, { onCloseParentModal: onCloseModal, movieInfo: movieInfo, handleRemoveMovie: handleRemoveMovie, isRemoveAvailable: isRemoveAvailable })), !isSearching && !chosenAlbum && (_jsx(MoviesPageTabs, { tabs: tabs, activeTab: tab, onTabClick: onTabClick, tabsClassnames: "CallsMovieChooseTabs" })), !isSearching && chosenAlbum && (_jsx("div", { className: "CallsMovieChooseAlbumTitle", children: _jsx(TextClamp, { Component: Title, lines: 1, children: chosenAlbum.title }) })), _jsxs("div", { className: "CallsMovieChooseTilesContent", children: [isSearching && (_jsx(SearchResults, { loading: searchVideos.loading, moviesData: searchVideos.data.mappedMovies, count: searchVideos.data.count, getNextPage: searchVideos.getNextPage, query: searchText.lastText, onMovieClick: onMovieClick, navigateToProfile: navigateToProfile })), !isSearching && tab === EMovieChooseTab.Recommended && (_jsx(TabRecommended, { onMovieClick: onMovieClick, navigateToProfile: navigateToProfile })), !isSearching && tab === EMovieChooseTab.Added && (_jsx(TabAdded, { onMovieClick: onMovieClick, navigateToProfile: navigateToProfile })), !isSearching && tab === EMovieChooseTab.Uploaded && (_jsx(TabUploaded, { onMovieClick: onMovieClick, navigateToProfile: navigateToProfile })), !isSearching && !chosenAlbum && tab === EMovieChooseTab.Albums && (_jsx(TabAlbums, { onAlbumClick: handleAlbumClick })), !isSearching && chosenAlbum && tab === EMovieChooseTab.Albums && (_jsx(TabAlbumVideos, { albumId: chosenAlbum.id, onMovieClick: onMovieClick, navigateToProfile: navigateToProfile })), isShowRemoveModal && (_jsx(RemoveMovieModal, { type: "changeVideo", onClose: () => setIsShowRemoveModal(false), onConfirm: onRemoveMovieConfirm }))] })] }));
});
/** чтобы не рендерился при фоновых обновлениях */
export const MovieChooseWidget = createWidget(Provider, MovieChooseComponent);
//# sourceMappingURL=MovieChooseContainer.js.map