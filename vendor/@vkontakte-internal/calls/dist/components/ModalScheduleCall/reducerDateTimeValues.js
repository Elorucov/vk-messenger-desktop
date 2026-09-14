import { EDuration, DURATION_MAP } from './constants';
import { getNextDateTime } from '../DatePicker/utils';
import { getDateProxy } from '../../hooks/useFormDatePickerValue';
import { isUndefined, isNumber } from '@vkontakte/vkjs';
export var EAction;
(function (EAction) {
    EAction["SetDuration"] = "set-duration";
    EAction["SetDateStart"] = "set-date-start";
    EAction["SetDateEnd"] = "set-date-end";
    EAction["ResetStartTime"] = "reset-start-time";
    EAction["ResetEndTime"] = "reset-end-time";
    EAction["SetRruleEnd"] = "set-rrule-end";
    EAction["SetTranslationDateStart"] = "set-translation-date-start";
})(EAction || (EAction = {}));
/**
 * @see https://jira.mvk.com/browse/CALL-8525
 *
 * описание логики можно найти в задаче
 */
export const reducer = (state, action) => {
    switch (action.type) {
        case EAction.SetDuration: {
            const duration = action.data;
            if (state.duration === duration) {
                return state;
            }
            const start = (() => {
                const result = { date: state.dateStart, time: state.timeStart };
                if (duration === EDuration['1day']) {
                    result.date = new Date(state.dateStart.getFullYear(), state.dateStart.getMonth(), state.dateStart.getDate());
                    result.time = getTime(result.date);
                }
                else if (state.duration === EDuration['1day']) {
                    const { roundToNearestMinutes } = state;
                    result.date = getDateProxy({
                        roundToNearestMinutes,
                        passedDate: state.dateStart,
                        passedTime: getTime(new Date()),
                    });
                    result.time = getTime(result.date);
                }
                return result;
            })();
            const end = getNextDateTime(start.date, start.time, getDurationValue({ duration }));
            const rruleEnd = getNextRruleEnd(state.rruleDateEnd, end.date);
            return {
                ...state,
                duration: action.data,
                dateEnd: end.date,
                timeEnd: end.time,
                dateStart: start.date,
                timeStart: start.time,
                rruleDateEnd: rruleEnd.date,
            };
        }
        case EAction.SetDateStart: {
            const { duration } = state;
            const { date, time } = action.data;
            const result = {
                ...state,
                dateStart: date,
                timeStart: time,
            };
            if (!!duration) {
                const end = getNextDateTime(date, time, getDurationValue({ duration }));
                const rruleEnd = getNextRruleEnd(state.rruleDateEnd, end.date);
                return {
                    ...result,
                    dateEnd: end.date,
                    timeEnd: end.time,
                    rruleDateEnd: rruleEnd.date,
                };
            }
            return result;
        }
        case EAction.SetDateEnd: {
            const { rruleDateEnd } = state;
            const { date, time } = action.data;
            const rruleEnd = getNextRruleEnd(rruleDateEnd, date);
            return {
                ...state,
                dateEnd: date,
                timeEnd: time,
                duration: undefined,
                rruleDateEnd: rruleEnd.date,
            };
        }
        case EAction.ResetStartTime: {
            const { roundToNearestMinutes, rruleDateEnd } = state;
            const date = getDateProxy({ roundToNearestMinutes });
            const time = getTime(date);
            const duration = (() => {
                if (state.duration === EDuration['1day']) {
                    return EDuration['30minutes'];
                }
                return state.duration;
            })();
            const end = getNextDateTime(date, time, getDurationValue({ duration }));
            const rruleEnd = getNextRruleEnd(rruleDateEnd, end.date);
            return {
                ...state,
                dateStart: date,
                timeStart: time,
                dateEnd: end.date,
                timeEnd: end.time,
                duration,
                rruleDateEnd: rruleEnd.date,
            };
        }
        case EAction.ResetEndTime: {
            const { roundToNearestMinutes, rruleDateEnd } = state;
            const date = getDateProxy({ roundToNearestMinutes });
            const time = getTime(date);
            const rruleEnd = getNextRruleEnd(rruleDateEnd, date);
            return {
                ...state,
                dateEnd: date,
                timeEnd: time,
                duration: undefined,
                rruleDateEnd: rruleEnd.date,
            };
        }
        case EAction.SetRruleEnd: {
            const rruleEnd = getRruleEnd(action.data.date);
            return {
                ...state,
                rruleDateEnd: rruleEnd.date,
                rruleTimeEnd: rruleEnd.time,
            };
        }
        case EAction.SetTranslationDateStart: {
            const { date, time } = action.data;
            return {
                ...state,
                translationDateStart: date,
                translationTimeStart: time,
            };
        }
        default:
            return state;
    }
};
export function getDurationValue({ call, duration }) {
    if (!isUndefined(duration)) {
        return DURATION_MAP[duration];
    }
    if (call?.schedule?.duration) {
        return call.schedule.duration * 1000;
    }
    return 0;
}
function getTime(date) {
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
    };
}
/**
 * хелпер для получения след состояния даты окончания периода повтора встречи
 * на основе данных по пред значению времени окончания встречи
 */
function getNextRruleEnd(rruleDateEnd, dateEnd) {
    const result = {
        date: rruleDateEnd,
        time: getTime(rruleDateEnd),
    };
    if (dateEnd.valueOf() > rruleDateEnd.valueOf()) {
        const nextDate = getRruleEnd(dateEnd);
        result.date = nextDate.date;
    }
    return result;
}
/**
 * хелпер для формирования значения даты окончания периода
 * повтора встречи на основе переданной даты
 */
export function getRruleEnd(date) {
    const _date = isNumber(date) ? new Date(date) : date;
    const nextDate = new Date(_date);
    nextDate.setHours(23, 59, 59, 0);
    return {
        date: nextDate,
        time: getTime(nextDate),
    };
}
//# sourceMappingURL=reducerDateTimeValues.js.map