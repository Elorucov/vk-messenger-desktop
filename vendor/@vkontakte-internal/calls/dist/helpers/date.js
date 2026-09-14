export const MINUTE = 1000 * 60;
export const HOUR = MINUTE * 60;
export const DAY = 86400;
export const WEEK = 7 * DAY;
export const SECOND_JS = 1000;
export function isInTimePeriod({ timestamp = Date.now(), timestampEnd = Infinity, timestampStart = -Infinity, } = {}) {
    return timestampStart <= timestamp && timestampEnd >= timestamp;
}
//# sourceMappingURL=date.js.map