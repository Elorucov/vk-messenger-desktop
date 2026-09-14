import { useMemo, useState } from 'react';
import { objectReduce, getCallable } from '../../helpers/helpers';
import { useFormSelectValue } from '../../hooks/useFormSelectValue';
import { timezones } from '@vkontakte-internal/calls-core';
export const useTimezones = ({ initialTimezone, startDate, startTime }) => {
    const locale = (window.langConfig?.locale || 'ru');
    const localeKey = locale === 'ru' ? 'title' : 'id';
    const [timezone] = useState(() => {
        return getCallable(initialTimezone) || new Intl.DateTimeFormat().resolvedOptions().timeZone;
    });
    const currTimezoneOption = useMemo(() => {
        const first = timezones[timezone];
        if (!first) {
            return;
        }
        return {
            label: formatLabel(first, localeKey),
            value: first.id,
        };
    }, [timezone, localeKey]);
    const list = useMemo(() => {
        // Получаем время начало звонка
        const callStartDate = new Date(startDate).setHours(startTime.hours, startTime.minutes);
        // Считаем, насколько оно отличается от текущего времени
        const callOffsetFromNowInMs = callStartDate - new Date().valueOf();
        const callOffsetFromNowInMinutes = callOffsetFromNowInMs / (1000 * 60);
        // Получаем временную зону в наших настройках
        const currentTimezoneOffsetInMinutes = startDate.getTimezoneOffset();
        // Считаем, какое смещение относительно нашей временной зоны
        const callOffset = (callOffsetFromNowInMinutes - currentTimezoneOffsetInMinutes) / 60;
        return objectReduce(timezones, (acc, value) => {
            // Проверяем, чтобы не было временных зон, которые сделают дату неверной, т.е. в прошлом
            if (value.offset > callOffset) {
                return acc;
            }
            acc.push({
                label: formatLabel(value, localeKey),
                value: value.id,
            });
            return acc;
        }, []);
    }, [localeKey, startDate, startTime]);
    return useFormSelectValue({
        options: list,
        initialValue: currTimezoneOption?.value,
    });
};
/** @returns {string} `Москва, UTC+3` */
function formatLabel(timezone, localeKey) {
    const offset = timezone.offset >= 0 ? `+${timezone.offset}` : timezone.offset;
    return `${timezone[localeKey]}, UTC${offset}`;
}
//# sourceMappingURL=useTimezones.js.map