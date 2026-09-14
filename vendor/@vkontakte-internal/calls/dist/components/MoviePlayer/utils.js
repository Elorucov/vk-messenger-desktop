const numberFormatter = new Intl.NumberFormat('ru-RU', {
    minimumIntegerDigits: 2,
});
export const getHours = (value) => Math.floor(value / 60 / 60);
export const formatTimeHHMMSS = (value) => {
    const hours = getHours(value);
    const mins = Math.floor((value - hours * 60 * 60) / 60);
    const secs = value - mins * 60 - hours * 60 * 60;
    const hoursFormatted = hours ? `${numberFormatter.format(hours)}:` : '';
    const minsFormatted = numberFormatter.format(mins);
    const secsFormatted = numberFormatter.format(secs);
    return `${hoursFormatted}${minsFormatted}:${secsFormatted}`;
};
//# sourceMappingURL=utils.js.map