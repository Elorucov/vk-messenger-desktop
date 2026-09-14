import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useStableCallback } from '@vkontakte-internal/react-utils';
import { useEffect, useRef, useState } from 'react';
import { turnItems } from './utils';
import styles from './IconSlider.module.css';
const ANIMATION_INTERVAL_MS = 1150;
const START_ANIMATION_MS = 575;
export const IconSlider = ({ children }) => {
    const [orderedIconIndexes, setOrderedIconIndexes] = useState(() => Array.from(children.keys()));
    const [animated, setAnimated] = useState(false);
    // TODO [react@>=19.0.0]: Заменить дженерик `T | undefined` на `T`
    const timeoutIdRef = useRef(undefined);
    const animateStable = useStableCallback(() => {
        if (orderedIconIndexes.length < 2) {
            return;
        }
        setOrderedIconIndexes(turnItems);
        setAnimated(false);
        timeoutIdRef.current = window.setTimeout(() => {
            setAnimated(true);
        });
    });
    useEffect(() => {
        let intervalId;
        const timeoutId = window.setTimeout(() => {
            setAnimated(true);
            intervalId = window.setInterval(animateStable, ANIMATION_INTERVAL_MS);
        }, START_ANIMATION_MS);
        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutIdRef.current);
        };
    }, [animateStable]);
    return (_jsx("div", { className: styles.container, children: _jsx("div", { className: classNames(styles.slides, animated && styles.slidesAnimated), children: orderedIconIndexes.map((iconIndex) => (_jsx("div", { className: styles.slide, children: children[iconIndex] }, iconIndex))) }) }));
};
//# sourceMappingURL=IconSlider.js.map