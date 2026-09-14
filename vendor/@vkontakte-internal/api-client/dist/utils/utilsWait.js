export const ONE_MINUTE_MS = 1000 * 60;
const BACKOFF_CHUNK = 100;
const MIN_WAIT_THRESHOLD = 500;
const MAX_WAIT_THRESHOLD = 1500;
export const getRandomWaitTime = (min = MIN_WAIT_THRESHOLD, max = MAX_WAIT_THRESHOLD) => {
    if (window.FORCED_API_WAIT_TIME) {
        return window.FORCED_API_WAIT_TIME;
    }
    return ~~(Math.random() * (max - min + 1) + min);
};
export const getWaitTimeExp = (retryCount) => {
    if (0 === retryCount) {
        return 0;
    }
    if (window.FORCED_API_WAIT_TIME) {
        return window.FORCED_API_WAIT_TIME;
    }
    const random = Math.random();
    const halfTime = (Math.pow(2, retryCount) * BACKOFF_CHUNK) / 2;
    return halfTime + halfTime * random;
};
export const waitTimeExp = (retryCount) => {
    if (retryCount === 0) {
        return Promise.resolve();
    }
    return waitTime(getWaitTimeExp(retryCount));
};
export function waitTime(delay) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), delay);
    });
}
//# sourceMappingURL=utilsWait.js.map