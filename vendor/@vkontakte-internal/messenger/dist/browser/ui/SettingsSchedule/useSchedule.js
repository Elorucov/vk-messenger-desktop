import React from 'react';
import { useBrowserEnv, useDispatch, useViewer } from '../../hooks/misc';
import { useEffect, useRef, useState } from 'react';
import { getFormattedTimeFromSeconds, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, isWeekendDay, Time, } from '../../../core/utils/time';
import { useSnackbar } from '../../hooks/useSnackbar';
import { Icon28CheckCircleOutline, Icon28ErrorCircleOutline, } from '@vkontakte/icons';
import { useApiFetch } from '../../hooks/useApiFetch';
const MAX_TIME_SECONDS = 14 * SECONDS_IN_HOUR; // максимальный интервал в секундах
const FULL_DAY_SECONDS = 24 * SECONDS_IN_HOUR; // весь день в секундах
const DEFAULT_START_WEEKDAY_SECONDS = 19 * SECONDS_IN_HOUR; // начало интервала в будний день по умолчанию
const DEFAULT_START_WEEKEND_SECONDS = 7 * SECONDS_IN_HOUR; // начало интервала в выходной день по умолчанию
const DEFAULT_FINISH_DAY_SECONDS = 7 * SECONDS_IN_HOUR; // окончание интервала по умолчанию
export const useSchedule = () => {
    const { lang } = useBrowserEnv();
    const apiFetch = useApiFetch();
    const dispatch = useDispatch();
    const snackbar = useSnackbar();
    const { viewer } = useViewer();
    const [schedule, setSchedule] = useState([]);
    const [changedDays, setChangedDays] = useState([]);
    const initialSchedule = useRef(schedule);
    const initialChangedDays = useRef(changedDays);
    const [dirty, setDirty] = useState(false);
    const [loading, setLoading] = useState(false);
    const [invalidDays, setInvalidDays] = useState([]);
    useEffect(() => {
        const scheduleIntervals = viewer.eduSchedule?.intervals || [];
        const schedule = getInitialSchedule(scheduleIntervals);
        const changedDays = getInitialChangedDays(scheduleIntervals);
        setSchedule(schedule);
        setChangedDays(changedDays);
        initialSchedule.current = schedule;
        initialChangedDays.current = changedDays;
    }, [viewer.eduSchedule?.intervals]);
    useEffect(() => {
        const isSameSchedule = JSON.stringify(initialSchedule.current) === JSON.stringify(schedule);
        setDirty(!isSameSchedule);
    }, [schedule]);
    const enableDay = (day) => () => {
        const defaultValue = {
            start: isWeekendDay(day)
                ? DEFAULT_START_WEEKEND_SECONDS
                : DEFAULT_START_WEEKDAY_SECONDS,
            finish: DEFAULT_FINISH_DAY_SECONDS,
        };
        setSchedule((schedule) => schedule.map((item, index) => {
            const enabled = !item.enabled;
            if (!enabled && item.dayNumber === day) {
                const initialDay = initialSchedule.current.find((item) => item.dayNumber === day);
                const start = initialDay?.start ?? defaultValue.start;
                const finish = initialDay?.finish ?? defaultValue.finish;
                validateInterval(day, { start, finish });
                return { ...item, enabled, start, finish };
            }
            return index === day ? { ...item, enabled } : item;
        }));
        setChangedDays((changedDays) => {
            if (changedDays.includes(day)) {
                return changedDays.filter((changedDay) => changedDay !== day);
            }
            return [...changedDays, day];
        });
    };
    const validateInterval = (day, { start, finish }) => {
        if (isWeekendDay(day)) {
            return;
        }
        // если заходим на следующий день
        if (finish <= start) {
            const duration = FULL_DAY_SECONDS - start + finish;
            if (duration > MAX_TIME_SECONDS) {
                setInvalidDays((errors) => [...errors, day]);
            }
            else {
                setInvalidDays((errors) => errors.filter((error) => error !== day));
            }
            return;
        }
        if (finish - start > MAX_TIME_SECONDS) {
            setInvalidDays((errors) => [...errors, day]);
        }
        else {
            setInvalidDays((errors) => errors.filter((error) => error !== day));
        }
    };
    const changeTime = (day, type) => (event) => {
        const value = Number(event.currentTarget.value);
        setSchedule((schedule) => schedule.map((item, index) => {
            if (index === day) {
                const times = {
                    start: type === 'start' ? value : item.start,
                    finish: type === 'start' ? item.finish : value,
                };
                validateInterval(day, times);
                return {
                    ...item,
                    ...times,
                };
            }
            return item;
        }));
    };
    const saveSchedule = async () => {
        // получаем номера дней, которые были однажды изменены и(или) были изменены сейчас
        const currentChangedDays = new Set([
            ...initialChangedDays.current,
            ...changedDays,
        ]);
        // массив с только измененными интервалами
        const onlyModifiedIntervals = [];
        for (const dayNumber of currentChangedDays) {
            const interval = schedule[dayNumber];
            if (!interval) {
                return;
            }
            onlyModifiedIntervals.push(interval);
        }
        setLoading(true);
        try {
            const zone = new Date().getTimezoneOffset() * -1;
            const onlyModifiedIntervalsParams = onlyModifiedIntervals.map(({ dayNumber, enabled, finish, start }) => {
                const baseDate = new Date();
                baseDate.setHours(0, 0, 0, 0);
                const startDate = new Date(baseDate);
                const startTimestamp = startDate.setSeconds(start);
                const finishDate = new Date(baseDate);
                if (finish <= start) {
                    finishDate.setHours(24);
                }
                const finishTimestamp = finishDate.setSeconds(finish);
                return {
                    day_num: dayNumber,
                    enabled,
                    start: Math.floor(startTimestamp / Time.Second),
                    finish: Math.floor(finishTimestamp / Time.Second),
                };
            });
            await apiFetch('messagesEdu.saveUserSchedule', {
                timezone: zone,
                schedule_intervals: JSON.stringify(onlyModifiedIntervalsParams),
            });
            dispatch({
                type: 'UnavailabilitySchedule_Update',
                userId: viewer.id,
                schedule: {
                    timezone: zone,
                    intervals: onlyModifiedIntervals.map(({ dayNumber, enabled, start, finish }) => ({
                        dayNumber,
                        enabled,
                        start,
                        finish,
                    })),
                },
            });
            setDirty(false);
            initialSchedule.current = schedule;
            snackbar({
                message: lang.use('me_edu_schedule_save_success'),
                before: (React.createElement(Icon28CheckCircleOutline, { fill: "var(--vkui--color_icon_positive)" })),
            });
        }
        catch (e) {
            snackbar({
                message: lang.use('me_edu_schedule_save_error'),
                before: (React.createElement(Icon28ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
            });
        }
        finally {
            setLoading(false);
        }
    };
    return {
        schedule,
        invalidDays,
        dirty,
        loading,
        options: getTimeOptions(),
        enableDay,
        changeTime,
        saveSchedule,
    };
};
function getTimeOptions() {
    const options = [];
    const allDaySeconds = 24 * SECONDS_IN_HOUR; // 24 часа
    const intervalSeconds = 15 * SECONDS_IN_MINUTE; // каждые 15 минут
    for (let s = 0; s <= allDaySeconds; s += intervalSeconds) {
        options.push({
            label: getFormattedTimeFromSeconds(s),
            value: s,
        });
    }
    return options;
}
function getInitialSchedule(scheduleIntervals) {
    // заполняем все дни расписания
    return [...Array(7).keys()].map((dayNumber) => {
        const currentInterval = scheduleIntervals.find((interval) => interval.dayNumber === dayNumber);
        if (!currentInterval) {
            return {
                dayNumber,
                enabled: false,
                start: isWeekendDay(dayNumber)
                    ? DEFAULT_START_WEEKEND_SECONDS
                    : DEFAULT_START_WEEKDAY_SECONDS,
                finish: DEFAULT_FINISH_DAY_SECONDS,
            };
        }
        return {
            dayNumber,
            enabled: currentInterval.enabled,
            start: currentInterval.start,
            finish: currentInterval.finish,
        };
    });
}
function getInitialChangedDays(scheduleIntervals) {
    return scheduleIntervals.map((interval) => interval.dayNumber);
}
//# sourceMappingURL=useSchedule.js.map