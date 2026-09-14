import React from 'react';
import { SkeletonLoader } from '../../ui/SkeletonLoader/SkeletonLoader';
import '../../ui/MiniAppPickerSkeleton/MiniAppPickerSkeleton.css';
const MiniAppItemSkeleton = () => {
    return (React.createElement("div", { className: "MiniAppPickerSkeleton__skeletonItem" },
        React.createElement("div", { className: "MiniAppPickerSkeleton__skeletonItemBody" },
            React.createElement(SkeletonLoader, { width: 44, height: 44, rounded: true, roundedRadius: 12 }),
            React.createElement("div", null,
                React.createElement(SkeletonLoader, { className: "MiniAppPickerSkeleton__skeletonItemTitle", width: 140, height: 12, rounded: true, roundedRadius: 4 }),
                React.createElement(SkeletonLoader, { width: 80, height: 12, rounded: true, roundedRadius: 4 }))),
        React.createElement("div", { className: "MiniAppPickerSkeleton__skeletonItemAction" },
            React.createElement(SkeletonLoader, { width: 80, height: 12, rounded: true, roundedRadius: 4 }))));
};
export const MiniAppPickerSkeleton = () => {
    return (React.createElement("div", { className: "MiniAppPickerSkeleton__skeleton" },
        React.createElement(SkeletonLoader, { className: "MiniAppPickerSkeleton__skeletonTitle", width: 140, height: 16, rounded: true, roundedRadius: 6 }),
        new Array(10).fill(null).map((_, index) => (React.createElement(MiniAppItemSkeleton, { key: index })))));
};
//# sourceMappingURL=MiniAppPickerSkeleton.js.map