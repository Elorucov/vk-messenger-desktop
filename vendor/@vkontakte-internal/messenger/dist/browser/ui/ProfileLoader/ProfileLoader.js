import '../../ui/ProfileLoader/ProfileLoader.css';
import React from 'react';
import { useLayoutData } from '../../ui/LayoutDataProvider/LayoutDataProvider';
import { Spinner } from '@vkontakte/vkui';
export const ProfileLoader = ({ type }) => {
    const { isMobileLayout } = useLayoutData();
    if (isMobileLayout) {
        return React.createElement(Spinner, null);
    }
    return React.createElement(ProfileSkeleton, { type: type });
};
const ProfileSkeleton = ({ type }) => {
    const isConvo = type === 'Convo';
    const renderInfoLine = ({ textWidth = 108, hasRightIcon = true } = {}) => {
        return (React.createElement("div", { className: "ProfileSkeleton__infoContainer ProfileSkeleton__container" },
            React.createElement("div", { className: "ProfileSkeleton__icon" }),
            React.createElement("div", { className: "ProfileSkeleton__infoText", style: { width: `${textWidth}px` } }),
            hasRightIcon && React.createElement("div", { className: "ProfileSkeleton__icon" })));
    };
    return (React.createElement("div", { className: "ProfileSkeleton ProfileSkeleton__container" },
        React.createElement("div", { className: "ProfileSkeleton__closeButtonContainer ProfileSkeleton__container" },
            React.createElement("div", { className: "ProfileSkeleton__closeButton" })),
        React.createElement("div", { className: "ProfileSkeleton__avatar" }),
        React.createElement("div", { className: "ProfileSkeleton__name" }),
        React.createElement("div", { className: "ProfileSkeleton__status" }),
        React.createElement("div", { className: "ProfileSkeleton__buttonContainer ProfileSkeleton__container" },
            React.createElement("div", { className: "ProfileSkeleton__button" }),
            React.createElement("div", { className: "ProfileSkeleton__button" }),
            React.createElement("div", { className: "ProfileSkeleton__button" }),
            isConvo && React.createElement("div", { className: "ProfileSkeleton__button" })),
        React.createElement("div", { className: "ProfileSkeleton__separator" }),
        renderInfoLine({ textWidth: 144, hasRightIcon: false }),
        renderInfoLine({ textWidth: 200 }),
        React.createElement("div", { className: "ProfileSkeleton__separator" }),
        renderInfoLine()));
};
//# sourceMappingURL=ProfileLoader.js.map