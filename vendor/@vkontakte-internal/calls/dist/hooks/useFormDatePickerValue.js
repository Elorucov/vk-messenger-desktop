import { useState, useCallback, useMemo } from 'react';
import { isSameDate } from '../components/DatePicker/utils';
import { useLocale } from '@vkontakte-internal/calls-core';
import { useLang } from './useLang';
import { getCallable } from '../helpers/helpers';
export const numberFormatter = new Intl.NumberFormat('ru-RU', {
    minimumIntegerDigits: 2,
});
export const useChosenDateText = () => {
    const { locale } = useLocale();
    const { getLang } = useLang();
    const format = useMemo(() => {
        const localeStr = locale === 'ru' ? 'ru-RU' : 'en-US';
        const DMMMM = new Intl.DateTimeFormat(localeStr, {
            day: '2-digit',
            month: 'long',
        });
        const YYYY = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
        });
        return {
            DMMMM,
            YYYY,
        };
    }, [locale]);
    /** форматированная строка с выбранным временем */
    const getChosenDateText = useCallback((date, time, isAllDay = false) => {
        const now = new Date();
        let datetime = getLang('calls_today');
        if (now.getFullYear() !== date.getFullYear()) {
            datetime = format.DMMMM.format(date);
            datetime += ` ${format.YYYY.format(date)}`;
        }
        else if (!isSameDate(now, date)) {
            datetime = format.DMMMM.format(date);
        }
        if (isAllDay) {
            return datetime;
        }
        const hours = numberFormatter.format(time.hours);
        const minutes = numberFormatter.format(time.minutes);
        const text = getLang('calls_date_in_time')
            .replace('{date}', datetime)
            .replace('{time}', `${hours}:${minutes}`);
        return text;
    }, [format, getLang]);
    return {
        getChosenDateText,
    };
};
export const useFormDatePickerValue = ({ initialDate, initialTime, roundToNearestMinutes, } = {}) => {
    const { getChosenDateText } = useChosenDateText();
    // datepicker props
    const [date, setDate] = useState(() => {
        return getDateProxy({
            passedDate: getCallable(initialDate) || new Date(),
            roundToNearestMinutes,
        });
    });
    const [time, setTime] = useState(() => {
        return (getCallable(initialTime) || {
            hours: date.getHours(),
            minutes: date.getMinutes(),
        });
    });
    /** отрабатываем календарь */
    const onChange = useCallback((passedDate, passedTime) => {
        setDate(passedDate);
        setTime(passedTime);
    }, []);
    /** форматированная строка с выбранным временем */
    const chosenDateText = useMemo(() => {
        return getChosenDateText(date, time);
    }, [date, time]);
    return {
        date,
        time,
        onChange,
        chosenDateText,
    };
};
export function getDateProxy({ passedDate, passedTime, roundToNearestMinutes, } = {}) {
    let _date = new Date(passedDate || Date.now());
    if (passedTime) {
        _date.setHours(passedTime.hours);
        _date.setMinutes(passedTime.minutes);
    }
    if (roundToNearestMinutes) {
        const coeff = 1000 * 60 * roundToNearestMinutes;
        _date = new Date(Math.ceil(_date.getTime() / coeff) * coeff);
    }
    return _date;
}
export function splitDateAndTime(dateTime) {
    const date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
    const time = {
        hours: dateTime.getHours(),
        minutes: dateTime.getMinutes(),
    };
    return { date, time };
}
//# sourceMappingURL=useFormDatePickerValue.js.map