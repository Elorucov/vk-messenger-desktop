import { useState, useMemo, useCallback } from 'react';
import { useLang } from '../../../hooks/useLang';
import { useConfig } from '../../../services/config';
import { EMovieChooseTab } from '../interfaces';
export const useTabs = () => {
    const [tab, setTab] = useState(EMovieChooseTab.Recommended);
    const { getLang } = useLang();
    const { enableWatchTogetherAlbums } = useConfig();
    const tabs = useMemo(() => {
        const tabs = [
            {
                id: EMovieChooseTab.Recommended,
                label: getLang('calls_movie_choose_recommended'),
            },
        ];
        if (enableWatchTogetherAlbums) {
            tabs.push({
                id: EMovieChooseTab.Albums,
                label: getLang('calls_movie_choose_albums'),
            });
        }
        tabs.push({
            id: EMovieChooseTab.Added,
            label: getLang('calls_movie_choose_added'),
        });
        tabs.push({
            id: EMovieChooseTab.Uploaded,
            label: getLang('calls_movie_choose_loaded'),
        });
        return tabs;
    }, [getLang]);
    const onTabClick = useCallback((nextTab) => {
        setTab(nextTab);
    }, []);
    return {
        tab,
        tabs,
        onTabClick,
    };
};
//# sourceMappingURL=useTabs.js.map