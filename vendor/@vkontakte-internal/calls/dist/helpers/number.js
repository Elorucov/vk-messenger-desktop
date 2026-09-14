/** `33.233231` -> `33%` */
export const shortPercentFormat = (value) => `${Math.round(value)}%`;
export function valueToPercent(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return ((value - min) * 100) / (max - min);
}
//# sourceMappingURL=number.js.map