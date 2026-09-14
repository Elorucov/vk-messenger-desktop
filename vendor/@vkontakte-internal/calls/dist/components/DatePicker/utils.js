import { dateToUnixTimestamp } from '../ModalScheduleCall';
/** хелпер для расчета disabled состоятния стреки выбора месяца */
export const isDisablePrevArrow = (min, curr) => {
    const minYear = min.getFullYear();
    const currYear = curr.getFullYear();
    if (currYear < minYear) {
        return true;
    }
    if (currYear > minYear) {
        return false;
    }
    return curr.getMonth() <= min.getMonth();
};
export const isSameDate = (a, b) => {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
};
/** маппер даты и времени в число, в `мс` или `секунды`, по выбору, через флаг `toUnixTs` */
export const getDateTimeValue = (date, time, toUnixTs = false) => {
    const result = new Date(date);
    result.setHours(time.hours);
    result.setMinutes(time.minutes);
    if (toUnixTs) {
        return dateToUnixTimestamp(result);
    }
    return Math.round(result.valueOf());
};
export function getNextDateTime(date, time, offset = 0) {
    const currPassedDate = new Date(date.valueOf());
    currPassedDate.setHours(time.hours, time.minutes);
    const nextDate = new Date(currPassedDate.valueOf() + offset);
    return {
        date: nextDate,
        time: {
            hours: nextDate.getHours(),
            minutes: nextDate.getMinutes(),
        },
    };
}
//# sourceMappingURL=utils.js.map