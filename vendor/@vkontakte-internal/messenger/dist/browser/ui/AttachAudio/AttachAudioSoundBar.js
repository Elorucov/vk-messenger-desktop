import './AttachAudioSoundBar.css';
import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import { getRandomFloat } from '../../../core/utils/misc';
export const AttachAudioSoundBar = ({ isActive, color, className, }) => {
    const rootEl = useRef(null);
    const MAX_HEIGHT = 14;
    const MIN_HEIGHT = 2;
    const isActiveRef = useRef(isActive);
    isActiveRef.current = isActive;
    const isResetAfterStop = useRef(false);
    const barSizes = [
        [0.4, 1],
        [0.3, 0.85],
        [0.2, 0.65],
        [0.05, 0.5],
    ];
    const animate = () => setInterval(() => {
        if (!rootEl.current)
            return;
        if (!isActiveRef.current && isResetAfterStop.current)
            return;
        const bars = rootEl.current.children;
        for (let i = 0; i < bars.length; i++) {
            const bar = bars[i];
            const barStyle = bar instanceof HTMLDivElement && bar.style;
            if (!barStyle) {
                return;
            }
            if (!isActiveRef.current) {
                barStyle.height = MIN_HEIGHT + 'px';
                continue;
            }
            const [min = 0, max = 0] = barSizes[i] ?? [];
            barStyle.height =
                getRandomFloat(MAX_HEIGHT * min, MAX_HEIGHT * max) + 'px';
        }
        isResetAfterStop.current = !isActiveRef.current;
    }, 150);
    useEffect(() => {
        const animateInterval = animate();
        return () => {
            clearInterval(animateInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const style = {
        ...(color && { color }),
    };
    return (React.createElement("div", { ref: rootEl, className: cx('AttachAudioSoundBar', className), style: style },
        React.createElement("div", { className: "AttachAudioSoundBar__bar" }),
        React.createElement("div", { className: "AttachAudioSoundBar__bar" }),
        React.createElement("div", { className: "AttachAudioSoundBar__bar" }),
        React.createElement("div", { className: "AttachAudioSoundBar__bar" })));
};
//# sourceMappingURL=AttachAudioSoundBar.js.map