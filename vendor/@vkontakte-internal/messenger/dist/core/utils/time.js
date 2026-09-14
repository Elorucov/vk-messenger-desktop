export const Time = {
    Second: 1000,
    Minute: 60 * 1000,
    Hour: 60 * 60 * 1000,
    HalfDay: 12 * 60 * 60 * 1000,
    Day: 24 * 60 * 60 * 1000,
    Week: 7 * 24 * 60 * 60 * 1000,
    Month: 4 * 7 * 24 * 60 * 60 * 1000,
};
export const SECONDS_IN_MINUTE = 60;
export const SECONDS_IN_HOUR = 60 * 60;
export const ALL_DAY_SECONDS = 24 * SECONDS_IN_HOUR;
export const SATURDAY = 5;
export const SUNDAY = 6;
export function getFormattedTimeFromSeconds(seconds) {
    const hour = (seconds / SECONDS_IN_HOUR) ^ 0;
    return (`0${hour === 24 ? '0' : hour}`.slice(-2) +
        ':' +
        ('0' + (seconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE).slice(-2));
}
export function getCurrentWeekDay() {
    const currentDay = new Date().getDay();
    return currentDay === 0 ? 6 : currentDay - 1;
}
export function getPreviousWeekDay(dayNumber) {
    return (dayNumber - 1 + 7) % 7;
}
export function getTimeInSecondsSinceStartDay(date) {
    return (date.getHours() * SECONDS_IN_HOUR + date.getMinutes() * SECONDS_IN_MINUTE);
}
export function isWeekendDay(dayNumber) {
    return dayNumber === SATURDAY || dayNumber === SUNDAY;
}
export function getNextWeekDayNumber(day) {
    return day === 6 ? 0 : day + 1;
}
export const getFutureTime = (interval, amount = 1) => {
    const date = new Date();
    switch (interval) {
        case 'hour':
            date.setHours(date.getHours() + amount);
            break;
        case 'day':
            date.setDate(date.getDate() + amount);
            break;
        case 'month':
            date.setMonth(date.getMonth() + amount);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() + amount);
            break;
        default:
            throw new Error('Invalid interval');
    }
    return date;
};
//# sourceMappingURL=time.js.map