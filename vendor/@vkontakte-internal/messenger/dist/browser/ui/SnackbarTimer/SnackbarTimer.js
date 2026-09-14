import '../../ui/Timer/Timer.css';
import React, { useEffect, useState } from 'react';
import { Timer } from '../../ui/Timer/Timer';
import { useSnackbarTimerContext } from '../../ui/Snackbar/SnackbarContext';
export const SnackbarTimer = ({ mode, callback }) => {
    const { duration, timeLeft } = useSnackbarTimerContext();
    const [isPaused, setPaused] = useState(false);
    useEffect(() => {
        setPaused(timeLeft === null);
    }, [timeLeft]);
    return (React.createElement(Timer, { mode: mode, duration: duration, isPaused: isPaused, callback: callback }));
};
//# sourceMappingURL=SnackbarTimer.js.map