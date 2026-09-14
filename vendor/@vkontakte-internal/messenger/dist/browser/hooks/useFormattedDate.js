import { useBrowserEnv } from '../hooks/misc';
import { useNow } from '../hooks/useNow';
import { isSameYear } from '../../core/utils/misc';
import { Time } from '../../core/utils/time';
export function useFormattedDate(timestamp) {
    const { lang } = useBrowserEnv();
    const now = useNow();
    if (!timestamp) {
        return [];
    }
    const delta = now - timestamp;
    switch (true) {
        case delta < Time.Minute:
            return [];
        /**
         * Ниже во всех case'ах, кроме последнего делаем округление в меньшую сторону,
         * чтобы не отображать 60 минут вместо 1. Подробнее тут: https://jira.mvk.com/browse/ME-37619.
         *
         * Для последнего case используем обычное округление, так как мы можем отобразить 4 недели,
         * потому что они не являются месяцем.
         *
         */
        case delta < Time.Hour:
            return [
                lang.use('me_convo_list_date_mins', {
                    values: {
                        time: Math.floor((delta % Time.Hour) / Time.Minute).toString(),
                    },
                }),
                lang.formatDate(timestamp, { now, variant: 'time-ago' }),
            ];
        case delta < Time.Day:
            return [
                lang.use('me_convo_list_date_hours', {
                    values: {
                        time: Math.floor((delta % Time.Day) / Time.Hour).toString(),
                    },
                }),
                lang.formatDate(timestamp, { now, variant: 'time-ago' }),
            ];
        case delta < Time.Week:
            return [
                lang.use('me_convo_list_date_days', {
                    values: {
                        time: Math.floor((delta % Time.Week) / Time.Day).toString(),
                    },
                }),
                lang.formatDate(timestamp, { now, variant: 'time-ago' }),
            ];
        case delta < Time.Month:
            return [
                lang.use('me_convo_list_date_weeks', {
                    values: {
                        time: Math.round((delta % Time.Month) / Time.Week).toString(),
                    },
                }),
                lang.formatDate(timestamp, { now, variant: 'time-ago' }),
            ];
        default:
            return [
                lang.use(isSameYear(now, timestamp) ? 'global_short_date' : 'global_date', {
                    now,
                    date: timestamp,
                    shortMonths: true,
                }),
                lang.formatDate(timestamp, { now, variant: 'time-ago' }),
            ];
    }
}
//# sourceMappingURL=useFormattedDate.js.map