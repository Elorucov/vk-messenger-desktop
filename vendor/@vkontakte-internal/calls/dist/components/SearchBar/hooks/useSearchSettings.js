import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":5}]} */
import { useCallback, useMemo, useState } from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { Checkbox, Select } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../../hooks/useLang';
import { EMovieCheckbox, EMovieDate, EMovieLength, EMovieSettingsType, EMovieSort, } from '../interfaces';
const initialSettings = {
    [EMovieSettingsType.Length]: false,
    [EMovieSettingsType.Date]: false,
    [EMovieSettingsType.Sort]: false,
    [EMovieSettingsType.Checkbox]: {
        [EMovieCheckbox.DirectTranslations]: false,
        [EMovieCheckbox.HighQuality]: false,
    },
};
/**
 * хук состояний для всплывающего меню настроек фильтров поисковой строки
 *
 * сделан через Dropdown, который может только принимать список элементов,
 * поэтому тут создается массив из jsx элементов. не идеально, но не требует
 * большого количества доработок =)
 *
 * тут же находятся все стейты селектов и чекбоксов, на ключе settings
 */
export const useSearchSettings = () => {
    const { getLang } = useLang();
    const getTranslateValue = (value) => {
        switch (value) {
            case EMovieLength.Any: {
                return getLang('calls_movie_player_filter_long_any');
            }
            case EMovieLength.Long: {
                return getLang('calls_movie_player_filter_long_long');
            }
            case EMovieLength.Short: {
                return getLang('calls_movie_player_filter_long_short');
            }
            case EMovieDate.Any: {
                return getLang('calls_movie_player_filter_date_any');
            }
            case EMovieDate.Day: {
                return getLang('calls_movie_player_filter_date_day');
            }
            case EMovieDate.Week: {
                return getLang('calls_movie_player_filter_date_week');
            }
            case EMovieDate.Month: {
                return getLang('calls_movie_player_filter_date_month');
            }
            case EMovieDate.Year: {
                return getLang('calls_movie_player_filter_date_year');
            }
            case EMovieSort.Relevance: {
                return getLang('calls_movie_player_sort_relevance');
            }
            case EMovieSort.Date: {
                return getLang('calls_movie_player_sort_date');
            }
            case EMovieSort.Length: {
                return getLang('calls_movie_player_sort_length');
            }
            case EMovieCheckbox.DirectTranslations: {
                return getLang('calls_movie_player_filter_live_translations');
            }
            case EMovieCheckbox.HighQuality: {
                return getLang('calls_movie_player_filter_high_quality');
            }
        }
    };
    const [settings, setSettings] = useState(initialSettings);
    const [tokens, setTokens] = useState([]);
    const optionsMapped = useMemo(() => {
        return {
            [EMovieSettingsType.Length]: [
                { value: EMovieLength.Any, label: getTranslateValue(EMovieLength.Any) },
                { value: EMovieLength.Long, label: getTranslateValue(EMovieLength.Long) },
                { value: EMovieLength.Short, label: getTranslateValue(EMovieLength.Short) },
            ],
            [EMovieSettingsType.Date]: [
                { value: EMovieDate.Any, label: getTranslateValue(EMovieDate.Any) },
                { value: EMovieDate.Day, label: getTranslateValue(EMovieDate.Day) },
                { value: EMovieDate.Week, label: getTranslateValue(EMovieDate.Week) },
                { value: EMovieDate.Month, label: getTranslateValue(EMovieDate.Month) },
                { value: EMovieDate.Year, label: getTranslateValue(EMovieDate.Year) },
            ],
            [EMovieSettingsType.Sort]: [
                { value: EMovieSort.Relevance, label: getTranslateValue(EMovieSort.Relevance) },
                { value: EMovieSort.Date, label: getTranslateValue(EMovieSort.Date) },
                { value: EMovieSort.Length, label: getTranslateValue(EMovieSort.Length) },
            ],
        };
    }, [getLang]);
    const onClearFilters = useCallback(() => {
        setSettings({ ...initialSettings });
        setTokens([]);
    }, []);
    const updateTokens = useCallback(({ id, text, value }) => {
        setTokens((prev) => {
            if (!value) {
                return prev.filter((token) => token.id !== id);
            }
            const next = [];
            let pushed = false;
            const nextToken = { id, text, value };
            for (const token of prev) {
                if (token.id === id) {
                    next.push(nextToken);
                    pushed = true;
                    continue;
                }
                next.push(token);
            }
            if (!pushed) {
                next.push(nextToken);
            }
            return next;
        });
    }, []);
    const onUpdateSettings = useCallback((data) => {
        switch (data.type) {
            case EMovieSettingsType.Length:
            case EMovieSettingsType.Date:
            case EMovieSettingsType.Sort:
                setSettings((prev) => ({
                    ...prev,
                    [data.type]: data.value,
                }));
                updateTokens({
                    id: data.type,
                    text: data.value ? getTranslateValue(data.value) : data.value,
                    value: data.value,
                });
                break;
            case EMovieSettingsType.Checkbox:
                setSettings((prev) => ({
                    ...prev,
                    [data.type]: {
                        ...prev[data.type],
                        [data.value]: data.subValue,
                    },
                }));
                updateTokens({
                    id: data.value,
                    text: getTranslateValue(data.value),
                    value: data.subValue,
                });
                break;
        }
    }, []);
    const onDeleteToken = useCallback((type, value) => {
        switch (type) {
            case EMovieSettingsType.Date:
            case EMovieSettingsType.Length:
            case EMovieSettingsType.Sort:
                onUpdateSettings({
                    type,
                    value: false,
                });
                break;
            case EMovieCheckbox.DirectTranslations:
            case EMovieCheckbox.HighQuality:
                onUpdateSettings({
                    type: EMovieSettingsType.Checkbox,
                    value: type,
                    subValue: !value,
                });
                break;
        }
    }, [onUpdateSettings]);
    const onChecked = useCallback((event) => {
        onUpdateSettings({
            type: EMovieSettingsType.Checkbox,
            value: event.target.name,
            subValue: event.target.checked,
        });
    }, [onUpdateSettings]);
    const handleSelectLength = useCallback((e) => onUpdateSettings({
        type: EMovieSettingsType.Length,
        value: e.target.value === EMovieLength.Any ? false : e.target.value,
    }), [onUpdateSettings]);
    const handleSelectDate = useCallback((e) => onUpdateSettings({
        type: EMovieSettingsType.Date,
        value: e.target.value === EMovieDate.Any ? false : e.target.value,
    }), [onUpdateSettings]);
    const handleSelectSort = useCallback((e) => onUpdateSettings({
        type: EMovieSettingsType.Sort,
        value: e.target.value === EMovieSort.Relevance ? false : e.target.value,
    }), [onUpdateSettings]);
    const dropdownRows = useMemo(() => {
        return [
            {
                id: 'length-title',
                text: (_jsx("div", { className: cx('CallsSearchBarSettingsRow--title', 'CallsSearchBarSettingsRow'), children: getLang('calls_movie_player_filter_long') })),
            },
            {
                id: 'length-select',
                text: (_jsx(Select, { name: EMovieSettingsType.Length, value: settings[EMovieSettingsType.Length] || EMovieLength.Any, options: optionsMapped[EMovieSettingsType.Length], onChange: handleSelectLength })),
            },
            {
                id: 'date-title',
                text: (_jsx("div", { className: cx('CallsSearchBarSettingsRow--title', 'CallsSearchBarSettingsRow'), children: getLang('calls_movie_player_filter_date') })),
            },
            {
                id: 'date-select',
                text: (_jsx(Select, { name: EMovieSettingsType.Date, value: settings[EMovieSettingsType.Date] || EMovieDate.Any, options: optionsMapped[EMovieSettingsType.Date], onChange: handleSelectDate })),
            },
            {
                id: 'sort-title',
                text: (_jsx("div", { className: cx('CallsSearchBarSettingsRow--title', 'CallsSearchBarSettingsRow'), children: getLang('calls_movie_player_sort') })),
            },
            {
                id: 'sort-select',
                text: (_jsx(Select, { name: EMovieSettingsType.Sort, value: settings[EMovieSettingsType.Sort] || EMovieSort.Relevance, options: optionsMapped[EMovieSettingsType.Sort], onChange: handleSelectSort })),
            },
            {
                id: 'checkbox-direct-translations',
                text: (_jsx("div", { className: "CallsSearchBarSettingsRow", children: _jsx(Checkbox, { name: EMovieCheckbox.DirectTranslations, checked: settings[EMovieSettingsType.Checkbox][EMovieCheckbox.DirectTranslations], onChange: onChecked, noPadding: true, children: getTranslateValue(EMovieCheckbox.DirectTranslations) }) })),
            },
            {
                id: 'checkbox-high-quality',
                text: (_jsx("div", { className: "CallsSearchBarSettingsRow", children: _jsx(Checkbox, { name: EMovieCheckbox.HighQuality, checked: settings[EMovieSettingsType.Checkbox][EMovieCheckbox.HighQuality], onChange: onChecked, noPadding: true, children: getTranslateValue(EMovieCheckbox.HighQuality) }) })),
            },
        ];
    }, [settings, onChecked, handleSelectLength, handleSelectDate, handleSelectSort]);
    return {
        dropdownRows,
        settings,
        tokens,
        onClearFilters,
        onDeleteToken,
    };
};
//# sourceMappingURL=useSearchSettings.js.map