/**
 * @description modulo, as described at:
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 */
export const modulo = (a, b) => ((a % b) + b) % b;
/**
 * @description fork from `global.php`
 * @param ts дата в UNIX формате, те будет умножена на 1000;
 *
 * получаем разбивку по числовым номиналам (год, месяц, день и тп)
 * c разницей между `ts` и текушей датой
 */
export const getAgeDiff = (ts, formatted = false) => {
    const result = {
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };
    // todo Возможно стоит в местах вызова передавать время умноженное на 1000
    const stamp = formatted ? ts : ts * 1000;
    const diff = Date.now() - stamp;
    if (diff < 0) {
        return result;
    }
    result.hours = Math.floor(modulo(diff / 1000, 86400) / 3600);
    result.minutes = Math.floor(modulo(diff / 1000, 3600) / 60);
    result.seconds = Math.floor(modulo(diff / 1000, 60));
    let date = new Date(stamp);
    const currDate = new Date();
    // this is fix for cases when user set '6 of Jule', but we set '5', but time is 22:00
    if (date.getHours() > currDate.getHours()) {
        // get next day
        date = new Date(stamp + (24 - date.getHours()) * 60 * 60 * 1000);
    }
    result.years = currDate.getFullYear() - date.getFullYear();
    result.months = currDate.getMonth() + 1 - (date.getMonth() + 1);
    result.days = currDate.getDate() - date.getDate();
    if (result.days < 0) {
        result.months--;
    }
    result.days = Math.floor(diff / 1000 / 86400);
    if (result.months < 0) {
        result.years--;
        result.months += 12;
    }
    // remove days for age > 1 month, you can fix it in the future
    if (result.years || result.months) {
        result.days = 0;
    }
    return result;
};
export function getCurrentTime(isMicrosec = true) {
    const strTime = Date.now().toString(10);
    if (isMicrosec) {
        return strTime + '000';
    }
    return strTime;
}
//# sourceMappingURL=time.js.map