import { ERepeatCallVariant, vkIdToPeerId, capitalize, } from '@vkontakte-internal/calls-core';
const DAY = 1000 * 60 * 60 * 24;
export const timeFormat = new Intl.DateTimeFormat('ru-RU', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
});
const dateMonthIntlRuFormat = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
});
const dateMonthIntlEnFormat = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
});
export function getWeekDayLang(day, getLang) {
    switch (day) {
        case 0: {
            return getLang('calls_on_sunday'); // воскресеньям
        }
        case 1: {
            return getLang('calls_on_monday'); // понедельникам
        }
        case 2: {
            return getLang('calls_on_tuesday'); // вторникам
        }
        case 3: {
            return getLang('calls_on_wednesday'); // средам
        }
        case 4: {
            return getLang('calls_on_thursday'); // четвергам
        }
        case 5: {
            return getLang('calls_on_friday'); // пятницам
        }
        case 6: {
            return getLang('calls_on_saturday'); // субботам
        }
    }
    return '';
}
/** 12 апреля */
export const dateMonthFormat = (date, locale) => {
    if (locale === 'ru') {
        return dateMonthIntlRuFormat.format(date);
    }
    return dateMonthIntlEnFormat.format(date);
};
const monthFormatRU = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
});
const monthFormatEN = new Intl.DateTimeFormat('en-US', {
    month: 'long',
});
const monthFormat = (date, locale) => {
    switch (locale) {
        case 'ru':
            return monthFormatRU.format(date);
        case 'en':
        default:
            return monthFormatEN.format(date);
    }
};
const isSameMonth = (a, b) => {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};
export const isToday = (a, b) => {
    return isSameMonth(a, b) && a.getDate() === b.getDate();
};
export const isTomorrow = (a, b) => {
    const tomorrow = new Date(a.valueOf() + DAY);
    return isToday(tomorrow, b);
};
const isSevenDaysTops = (a, b) => {
    return Math.abs(a.valueOf() - b.valueOf()) / DAY < 7;
};
const isSameYear = (a, b) => {
    return a.getFullYear() === b.getFullYear();
};
const getDayTitleFn = () => {
    let isTodayOrTomorrow = false;
    const getDayTitle = (now, date, locale, getLang) => {
        switch (true) {
            case isToday(now, date): {
                isTodayOrTomorrow = true;
                const t = getLang('calls_today');
                return `${t}, ${dateMonthFormat(date, locale)}`;
            }
            case isTomorrow(now, date): {
                isTodayOrTomorrow = true;
                const t = getLang('calls_tomorrow');
                return `${t}, ${dateMonthFormat(date, locale)}`;
            }
            case isSevenDaysTops(now, date): {
                if (!isTodayOrTomorrow) {
                    return getLang('calls_five_days_tops').replace('{days}', String(7));
                }
                return getLang('calls_five_days_tops').replace('{days}', String(5));
            }
            case isSameMonth(now, date): {
                return getLang('calls_this_month');
            }
            default: {
                let title = capitalize(monthFormat(date, locale));
                if (!isSameYear(now, date)) {
                    title += `, ${date.getFullYear()}`;
                }
                return title;
            }
        }
    };
    return {
        getDayTitle,
    };
};
const mapGroups = (groups) => {
    if (!groups) {
        return null;
    }
    return groups?.reduce((acc, group) => {
        return {
            ...acc,
            [group.id]: group,
        };
    }, {});
};
export const mapCalls = ({ now, items, locale, getLang, groups: _groups, }) => {
    const groups = mapGroups(_groups);
    const temp = new Map();
    const { getDayTitle } = getDayTitleFn();
    const callerIds = new Set();
    if (items) {
        for (const { ...item } of items) {
            const group = !!(groups && item.caller_id) && groups[Math.abs(item.caller_id)];
            if (group) {
                item.group = group;
            }
            const date = new Date((item.schedule?.time || 0) * 1000);
            const title = getDayTitle(now, date, locale, getLang);
            if (item.caller_id) {
                callerIds.add(vkIdToPeerId(item.caller_id));
            }
            // создаем блок со звонками
            if (!temp.has(title)) {
                const calls = new Map();
                calls.set(item.call_id, item);
                temp.set(title, {
                    title,
                    calls,
                    isToday: isToday(now, date) || undefined,
                    isTomorrow: isTomorrow(now, date) || undefined,
                });
                // (!)
                continue;
            }
            // добавляем в блок только первое планирование из повторяющихся
            if (!temp.get(title)?.calls.has(item.call_id)) {
                temp.get(title)?.calls.set(item.call_id, item);
            }
        }
    }
    let total = 0;
    const calls = [];
    for (const value of temp.values()) {
        const _calls = [...value.calls.values()];
        total += _calls.length;
        calls.push({
            ...value,
            calls: _calls,
        });
    }
    return {
        calls,
        callerIds,
        total,
    };
};
/** возвращает по типу дня - "по рабочим или "по выходным" */
export const getTypeOfDay = (date, getLang) => {
    switch (date.getDay()) {
        case 0:
        case 6:
            return getLang('calls_on_dayoffs'); // по выходным
        default:
            return getLang('calls_on_workdays'); // по рабочим
    }
};
const getDescPrefix = (date, locale, isTodayOrTomorrow) => {
    return isTodayOrTomorrow ? '' : `${dateMonthFormat(date, locale)} · `;
};
export const getRepeatDescription = (date, repeatRule, getLang, locale, isTodayOrTomorrow) => {
    switch (repeatRule) {
        // eжедневно
        case ERepeatCallVariant.Daily: {
            return getLang('calls_daily');
        }
        // ежемесячно
        case ERepeatCallVariant.Monthly: {
            let desc = getDescPrefix(date, locale, isTodayOrTomorrow);
            desc += getLang('calls_monthly');
            return desc;
        }
        // по пятницам
        case ERepeatCallVariant.Weekly: {
            let desc = getDescPrefix(date, locale, isTodayOrTomorrow);
            desc += getLang('calls_on').replace('{day}', getWeekDayLang(date.getDay(), getLang));
            return desc;
        }
        // по будням / выходным
        case 'weekdays':
        case 'weekend':
        case ERepeatCallVariant.WeeklyOnDayType: {
            let desc = getDescPrefix(date, locale, isTodayOrTomorrow);
            desc += getTypeOfDay(date, getLang);
            return desc;
        }
        // ежегодно
        case ERepeatCallVariant.Yearly: {
            let desc = getDescPrefix(date, locale, isTodayOrTomorrow);
            desc += getLang('calls_yearly');
            return desc;
        }
        // единоразовое мероприятие
        default: {
            return '';
        }
    }
};
//# sourceMappingURL=utils.js.map