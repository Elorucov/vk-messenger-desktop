import '../../ui/SkeletonLoader/SkeletonLoader.css';
import React from 'react';
import cx from 'classnames';
export const SkeletonLoader = ({ height, width, rounded = false, roundedRadius = 10, animationStartColor = 'hsl(200, 20%, 85%)', animationEndColor = 'hsl(200, 20%, 95%)', className, }) => {
    const styles = {
        width,
        height,
        '--animation-start-color': animationStartColor,
        '--animation-end-color': animationEndColor,
        ...(rounded && { borderRadius: roundedRadius }),
    };
    return React.createElement("div", { className: cx('SkeletonLoader', className), style: styles });
};
//# sourceMappingURL=SkeletonLoader.js.map