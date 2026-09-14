import { useCallback, useEffect, useState } from 'react';
export function useCountdown({ time, step = 1, interval = 1000, onTimeOver, onStart, }) {
    const [isRunning, setRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(time);
    useEffect(() => {
        if (currentTime <= 0) {
            setRunning(false);
            onTimeOver?.();
        }
    }, [currentTime, onTimeOver]);
    useEffect(() => {
        setRunning(false);
        setCurrentTime(time);
    }, [time]);
    useEffect(() => {
        if (!isRunning) {
            setCurrentTime(time);
        }
    }, [isRunning, time]);
    useEffect(() => {
        let intervalId = null;
        if (isRunning) {
            onStart?.();
            intervalId = setInterval(() => {
                setCurrentTime((prev) => prev - step);
            }, interval);
        }
        else if (intervalId) {
            clearInterval(intervalId);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [interval, isRunning, onStart, step]);
    const start = useCallback(() => {
        setRunning(true);
    }, []);
    return {
        start,
        currentTime,
    };
}
//# sourceMappingURL=useCountdown.js.map