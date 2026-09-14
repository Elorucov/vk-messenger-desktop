import '../../ui/ProgressCircle/ProgressCircle.css';
import React from 'react';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
export const ProgressCircle = ({ size, progress, strokeWidth = 2, strokeColor = 'white', strokeOverlayColor, className, ariaLabel, }) => {
    const { lang } = useBrowserEnv();
    const radius = (size - strokeWidth) / 2;
    const viewBox = `0 0 ${size} ${size}`;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * progress) / 100;
    return (React.createElement("div", { role: "progressbar", className: cx('ProgressCircle', className), style: { width: size, height: size }, "aria-label": ariaLabel ?? lang.use('me_progress_circle_default_aria_label'), "aria-valuenow": Math.floor(progress) },
        React.createElement("svg", { width: size, height: size, viewBox: viewBox },
            strokeOverlayColor && (React.createElement("circle", { className: "ProgressCircle__progressOverlay", cx: size / 2, cy: size / 2, r: radius, stroke: strokeOverlayColor, strokeWidth: `${strokeWidth}px` })),
            React.createElement("circle", { className: "ProgressCircle__progress", cx: size / 2, cy: size / 2, r: radius, stroke: strokeColor, strokeWidth: `${strokeWidth}px`, transform: `rotate(-90 ${size / 2} ${size / 2})`, style: {
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                } }))));
};
//# sourceMappingURL=ProgressCircle.js.map