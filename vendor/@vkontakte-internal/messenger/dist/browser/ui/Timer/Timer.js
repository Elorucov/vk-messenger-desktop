import '../../ui/Timer/Timer.css';
import React, { useEffect, useState } from 'react';
import { Loader } from '../../ui/Loader/Loader';
import cx from 'classnames';
export const Timer = ({ duration, callback, mode, isPaused, }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const secondsAmount = duration / 1000;
    useEffect(() => {
        if (isPaused) {
            setTimeLeft(duration / 1000);
        }
    }, [duration, isPaused]);
    useEffect(() => {
        let raf;
        let startTime;
        const createTimer = (ms) => {
            if (isPaused) {
                return;
            }
            if (startTime === undefined) {
                startTime = ms;
            }
            const elapsed = ms - startTime;
            const timeLeftValue = Math.max(secondsAmount - elapsed / 1000, 0);
            setTimeLeft(timeLeftValue);
            raf = window.requestAnimationFrame(createTimer);
        };
        raf = window.requestAnimationFrame(createTimer);
        return () => {
            if (raf) {
                cancelAnimationFrame(raf);
            }
        };
    }, [isPaused, secondsAmount]);
    useEffect(() => {
        if (timeLeft === 0) {
            callback?.();
        }
    }, [callback, timeLeft]);
    return (React.createElement(Loader, { size: "small", classNames: {
            loaderProgress: 'Timer__loaderProgress',
            loaderContent: cx('Timer__loaderContent', {
                'Timer__loaderContent--dark': mode === 'dark',
            }),
        }, progress: (timeLeft / secondsAmount) * 100 }, Math.ceil(timeLeft)));
};
//# sourceMappingURL=Timer.js.map