import { useBrowserEnv, usePrevious } from '../../hooks/misc';
import '../../ui/AnimatedCounter/AnimatedCounter.css';
import cx from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
export const AnimatedCounter = ({ count, className, format = 'short' }) => {
    const { lang } = useBrowserEnv();
    const prevCount = usePrevious(count);
    const formattedCount = lang.formatNumber(count, format);
    const prevFormattedCount = usePrevious(formattedCount);
    const isAnimating = useRef(false);
    const delayedFormattedCount = useRef(undefined);
    const displayFormattedCount = useRef({
        value: formattedCount,
        count,
    });
    const [displayCounter, setDisplayCounter] = useState({
        prev: formattedCount,
        next: formattedCount,
        countDown: false,
    });
    const onAnimationEnd = useCallback(() => {
        if (delayedFormattedCount.current !== undefined) {
            setDisplayCounter({
                prev: displayFormattedCount.current.value,
                next: delayedFormattedCount.current.value,
                countDown: delayedFormattedCount.current.count <
                    displayFormattedCount.current.count,
            });
            displayFormattedCount.current = delayedFormattedCount.current;
            delayedFormattedCount.current = undefined;
            return;
        }
        isAnimating.current = false;
        setDisplayCounter({
            prev: displayFormattedCount.current.value,
            next: displayFormattedCount.current.value,
            countDown: false,
        });
    }, []);
    useEffect(() => {
        if (prevFormattedCount === undefined || prevCount === undefined) {
            return;
        }
        if (isAnimating.current) {
            delayedFormattedCount.current = {
                value: formattedCount,
                count,
            };
            return;
        }
        isAnimating.current = true;
        displayFormattedCount.current = {
            value: formattedCount,
            count,
        };
        setDisplayCounter({
            prev: prevFormattedCount,
            next: formattedCount,
            countDown: count < prevCount,
        });
        // Хотим обновляться только при изменении текста счетчика
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formattedCount]);
    const renderedCounter = useMemo(() => {
        const res = [];
        const counterLength = Math.max(displayCounter.prev.length, displayCounter.next.length);
        const paddedPrev = displayCounter.prev.padStart(counterLength, ' ');
        const paddedNext = displayCounter.next.padStart(counterLength, ' ');
        let hasDiff = false;
        for (let i = 0; i < counterLength; i++) {
            const prevChar = paddedPrev[i];
            const nextChar = paddedNext[i];
            const key = `${nextChar}${counterLength - i}`;
            if (nextChar === undefined ||
                prevChar === undefined ||
                nextChar === prevChar) {
                res.push(React.createElement("span", { key: key }, nextChar));
                continue;
            }
            res.push(React.createElement("div", { key: key, className: "AnimatedCounter__digitWrapper" },
                React.createElement("span", { onAnimationEnd: !hasDiff ? onAnimationEnd : undefined, className: "AnimatedCounter__prevDigit" }, prevChar),
                React.createElement("span", { className: "AnimatedCounter__nextDigit" }, nextChar),
                React.createElement("span", { className: "AnimatedCounter__digit" }, nextChar !== ' ' ? nextChar : prevChar)));
            hasDiff = true;
        }
        return res;
    }, [displayCounter.next, displayCounter.prev, onAnimationEnd]);
    return (React.createElement("span", { className: cx(className, 'AnimatedCounter', {
            'AnimatedCounter--down': displayCounter.countDown,
        }) }, renderedCounter));
};
//# sourceMappingURL=AnimatedCounter.js.map