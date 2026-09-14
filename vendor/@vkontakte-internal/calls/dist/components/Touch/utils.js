/** @fork https://gitlab.mvk.com/messenger/reforged */
export const validateCoord = (min, max, val, sens) => {
    const v = Math.max(min, Math.min(max, val));
    if (Math.abs(v - min) < sens) {
        return min;
    }
    if (Math.abs(v - max) < sens) {
        return max;
    }
    return v;
};
export const checkIgnoredSelectors = (event, ignoreSelectors) => {
    if (!ignoreSelectors) {
        return false;
    }
    return ignoreSelectors.some((selector) => {
        return event.originalEvent.target.closest?.(selector);
    });
};
//# sourceMappingURL=utils.js.map