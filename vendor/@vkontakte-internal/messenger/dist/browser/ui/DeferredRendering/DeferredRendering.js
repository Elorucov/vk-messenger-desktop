import { useEffect, useState } from 'react';
export const DeferredRendering = ({ children, fallback = null }) => {
    const [isRendered, setRendered] = useState(false);
    useEffect(() => setRenderTimeout(() => {
        setRendered(true);
    }), []);
    if (!isRendered) {
        return fallback;
    }
    return children;
};
/**
 * Выставляем только один таймаут для всех рендеримых DeferredRendering,
 * так как вызов setTimeout не дешевый по времени, и их большое
 * количество негативно сказывается на перформансе.
 */
let callbacks = [];
let timeoutId;
const setRenderTimeout = (callback) => {
    callbacks.push(callback);
    if (timeoutId === undefined) {
        timeoutId = window.setTimeout(() => {
            timeoutId = undefined;
            /**
             * Внимательному читателю код ниже покажется странным,
             * но в https://jira.mvk.com/browse/ME-78805 мы поняли,
             * что нам лучше сделать так.
             */
            const cbs = [...callbacks];
            callbacks = [];
            cbs.forEach((cb) => cb());
        }, 0);
    }
};
//# sourceMappingURL=DeferredRendering.js.map