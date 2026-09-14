import { formatCount } from '@vkontakte-internal/utils';
import { EMovieDate, EMovieSettingsType, EMovieCheckbox, EMovieSort, } from '../../components/SearchBar/interfaces';
import { SORT_MAP, FILTERS_MAP, DEFAULT_COUNT } from './constants';
export const getMovieBackgroundUrl = ({ targetSize, image }) => {
    if (!image) {
        return '';
    }
    let max = null;
    for (const size of image) {
        if (size.height >= targetSize.h && size.width >= targetSize.w) {
            return size.url;
        }
        if (size.height > (max?.height || 0) && size.width > (max?.width || 0)) {
            max = size;
        }
    }
    return max ? max.url : '';
};
/** мапа ответа с мувиками пользователя в состояния для вьхи */
export const mapData = (data) => {
    const groups = new Map();
    const profiles = new Map();
    if (data.groups) {
        for (const group of data.groups) {
            groups.set(group.id, group);
        }
    }
    if (data.profiles) {
        for (const profile of data.profiles) {
            profiles.set(profile.id, profile);
        }
    }
    return data.items.map((movie) => {
        const ownerId = Math.abs(movie.owner_id || 0);
        return {
            movie,
            group: groups.get(ownerId),
            profile: profiles.get(ownerId),
        };
    });
};
/**
 * функция-мапа между енумом фильтра по времени
 * и параметром для сетевого вызова
 */
export const mapMovieDateToTimestamp = (date) => {
    const day = 24 * 60 * 60;
    switch (date) {
        case EMovieDate.Any:
        case false:
            return undefined;
        case EMovieDate.Day:
            return day;
        case EMovieDate.Week:
            return day * 7;
        case EMovieDate.Month:
            return day * 30;
        case EMovieDate.Year:
            return day * 365;
    }
};
/**
 * функция-маппер фильтров поиска мувика в
 * параметры сетевого вызова поиска
 */
export const mapSearchMovieSettings = ({ searchSettings: ss, searchText, offset, }) => {
    // params
    const sortKey = ss[EMovieSettingsType.Sort];
    const lengthKey = ss[EMovieSettingsType.Length];
    const hdKey = ss[EMovieSettingsType.Checkbox][EMovieCheckbox.HighQuality];
    const liveKey = ss[EMovieSettingsType.Checkbox][EMovieCheckbox.DirectTranslations];
    return {
        q: searchText,
        adult: 0,
        sort: sortKey ? SORT_MAP[sortKey] : SORT_MAP[EMovieSort.Relevance],
        hd: hdKey ? 1 : 0,
        filters: lengthKey ? FILTERS_MAP[lengthKey] : undefined,
        live: liveKey ? 1 : 0,
        search_own: 0,
        date: mapMovieDateToTimestamp(ss[EMovieSettingsType.Date]),
        offset,
        count: DEFAULT_COUNT,
    };
};
export const getMaxPreview = (thumbnails = []) => {
    let moviePreview = {
        url: '',
        width: 0,
        height: 0,
    };
    thumbnails.forEach((preview) => {
        if (moviePreview.width < preview.width) {
            moviePreview = preview;
        }
    });
    return moviePreview;
};
export var DigitPlace;
(function (DigitPlace) {
    DigitPlace["Thousands"] = "thousands";
    DigitPlace["Millions"] = "millions";
    DigitPlace["Billions"] = "billions";
    DigitPlace["Unknown"] = "unknown";
})(DigitPlace || (DigitPlace = {}));
export const getFormattedCount = (count, options) => {
    // если есть конфиг локали, то берем информацию из него
    const locale = window.langConfig?.locale || 'ru';
    const absoluteCount = Math.abs(count);
    let [, value, stringDigitPlace] = (formatCount(absoluteCount, options).match(/^(.+?)([BKM]?)$/) ||
        []);
    let digitPlace = DigitPlace.Unknown;
    if (!value) {
        value = count.toLocaleString(locale);
    }
    switch (stringDigitPlace) {
        case 'B':
            digitPlace = DigitPlace.Billions;
            break;
        case 'K':
            digitPlace = DigitPlace.Thousands;
            if (value && absoluteCount >= 1e5) {
                value = parseInt(value, 10).toString();
            }
            break;
        case 'M':
            digitPlace = DigitPlace.Millions;
            break;
    }
    return { count, digitPlace, value: count < 0 ? `-${value}` : value };
};
//# sourceMappingURL=utils.js.map