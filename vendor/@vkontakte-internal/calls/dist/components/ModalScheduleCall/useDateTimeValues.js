import { useCallback, useMemo, useReducer } from 'react';
import { getDateProxy, useChosenDateText, } from '../../hooks/useFormDatePickerValue';
import { getDateTimeValue, getNextDateTime } from '../DatePicker/utils';
import { DURATION_MAP, EDuration } from './constants';
import { EAction, getDurationValue, getRruleEnd, reducer, } from './reducerDateTimeValues';
import { mapRecurrenceRule } from './utils';
import { ERepeatCallVariant, ETranslationPlannedTimeVariant } from '@vkontakte-internal/calls-core';
const ROUND_TO_NEAREST_MINUTES = 30;
export const objSwitchKeyValues = (obj) => {
    const res = {};
    Object.entries(obj).forEach(([key, value]) => {
        res[value] = key;
    });
    return res;
};
/** инициатор редюсера по контролю за полями хука */
const init = ({ call }) => {
    const duration = call
        ? objSwitchKeyValues(DURATION_MAP)[(call.schedule?.duration || 0) * 1000]
        : EDuration['30minutes'];
    const { date: dateStart, time: timeStart } = getInitDateStart(call?.schedule.time);
    const { date: translationDateStart, time: translationTimeStart } = getInitDateStart();
    const end = getNextDateTime(dateStart, timeStart, getDurationValue({ call, duration }));
    const dateEnd = end.date;
    const timeEnd = end.time;
    const rruleEnd = call?.schedule.recurrence_until_time
        ? getRruleEnd(call?.schedule.recurrence_until_time * 1000)
        : getRruleEnd(dateEnd);
    return {
        duration,
        dateStart,
        timeStart,
        dateEnd,
        timeEnd,
        roundToNearestMinutes: ROUND_TO_NEAREST_MINUTES,
        rruleDateEnd: rruleEnd.date,
        rruleTimeEnd: rruleEnd.time,
        translationDateStart,
        translationTimeStart,
    };
};
function getTimeStart(date) {
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
    };
}
/**
 * хук-контроллер для управления состоянием связки полей:
 *
 * - дата и время начала встречи
 * - продолжительность встречи
 * - дата и время окончания встречи
 *
 * нужен тк изменение любого из полей ведет к изменению
 * одного или всех других полей
 */
export const useDateTimeValues = (params) => {
    const { getChosenDateText } = useChosenDateText();
    const [state, dispatch] = useReducer(reducer, params, init);
    /** признак, что выбрана продолжительность "весь день" */
    const isAllDay = state.duration === EDuration['1day'];
    /** вычисляемая продолжительность звонка (в миллисекундах) */
    const durationMs = useMemo(() => {
        const starttime = getDateTimeValue(state.dateStart, state.timeStart);
        const endtime = getDateTimeValue(state.dateEnd, state.timeEnd);
        return endtime - starttime;
    }, [state.dateStart, state.timeStart, state.dateEnd, state.timeEnd]);
    /** вычисляемое начало звонка (в секундах) */
    const startTimeMs = useMemo(() => {
        return getDateTimeValue(state.dateStart, state.timeStart);
    }, [state.dateStart, state.timeStart]);
    /** выбор чипа с длительностью звонка */
    const handleChangeDuration = useCallback((option) => {
        dispatch({
            type: EAction.SetDuration,
            data: option.value,
        });
    }, []);
    /** контекст для выбора даты и времени "начала" */
    const dateStartCtx = useMemo(() => {
        return {
            date: state.dateStart,
            time: state.timeStart,
            onChange: (date, time) => {
                dispatch({
                    type: EAction.SetDateStart,
                    data: { date, time },
                });
                if (params.translationTimeVariant === ETranslationPlannedTimeVariant.EqualToCallTime) {
                    dispatch({
                        type: EAction.SetTranslationDateStart,
                        data: { date, time },
                    });
                }
            },
            onReset: () => {
                dispatch({
                    type: EAction.ResetStartTime,
                });
            },
            chosenDateText: getChosenDateText(state.dateStart, state.timeStart, isAllDay),
            disableDateSelect: mapRecurrenceRule(params.call?.schedule.recurrence_rule) !== ERepeatCallVariant.Never,
        };
    }, [
        state.dateStart,
        state.timeStart,
        isAllDay,
        params.call?.schedule.recurrence_rule,
        params.translationTimeVariant,
    ]);
    /** контекст для выбора даты и времени "конца" */
    const dateEndCtx = useMemo(() => {
        return {
            date: state.dateEnd,
            time: state.timeEnd,
            onChange: (date, time) => {
                dispatch({
                    type: EAction.SetDateEnd,
                    data: { date, time },
                });
            },
            onReset: () => {
                dispatch({
                    type: EAction.ResetEndTime,
                });
            },
            chosenDateText: isAllDay
                ? getChosenDateText(state.dateStart, state.timeStart, isAllDay)
                : getChosenDateText(state.dateEnd, state.timeEnd, isAllDay),
        };
    }, [state.dateEnd, state.timeEnd, isAllDay, state.dateStart, state.timeStart]);
    /** контекст для выбора даты и времени "конца периода планирования" */
    const rruleEndCtx = useMemo(() => {
        return {
            date: state.rruleDateEnd,
            time: state.rruleTimeEnd,
            chosenDateText: '',
            onChange: (date, time) => {
                dispatch({
                    type: EAction.SetRruleEnd,
                    data: { date, time },
                });
            },
        };
    }, [state.rruleDateEnd, state.rruleTimeEnd]);
    /** контекст для выбора даты и времени "начала трансляции" */
    const translationDateStartCtx = useMemo(() => ({
        date: state.translationDateStart,
        time: state.translationTimeStart,
        onChange: (date, time) => {
            dispatch({
                type: EAction.SetTranslationDateStart,
                data: { date, time },
            });
        },
        forceSetTime: (value, convertUnix = true) => {
            const { date, time } = getInitDateStart(value, convertUnix);
            dispatch({
                type: EAction.SetTranslationDateStart,
                data: { date, time },
            });
        },
        chosenDateText: getChosenDateText(state.translationDateStart, state.translationTimeStart),
    }), [state.translationDateStart, state.translationTimeStart]);
    /** вычисляемое начало трансляции (в секундах) */
    const translationStartTimeMs = useMemo(() => {
        return getDateTimeValue(state.translationDateStart, state.translationTimeStart);
    }, [state.translationDateStart, state.translationTimeStart]);
    return {
        dateStartCtx,
        dateEndCtx,
        duration: state.duration,
        handleChangeDuration,
        durationMs,
        startTimeMs,
        isAllDay,
        rruleEndCtx,
        translationDateStartCtx,
        translationStartTimeMs,
    };
};
function getInitDateStart(value, convertUnix = true) {
    const date = value
        ? new Date(convertUnix ? value * 1000 : value)
        : getDateProxy({
            passedDate: new Date(),
            roundToNearestMinutes: ROUND_TO_NEAREST_MINUTES,
        });
    return {
        date,
        time: getTimeStart(date),
    };
}
//# sourceMappingURL=useDateTimeValues.js.map