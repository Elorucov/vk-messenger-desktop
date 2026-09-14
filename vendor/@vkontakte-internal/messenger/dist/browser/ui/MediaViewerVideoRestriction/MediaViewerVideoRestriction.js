import React from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import './MediaViewerVideoRestriction.css';
import { Button } from '@vkontakte/vkui';
import { RestrictionIcon } from '../../ui/RestrictionIcon/RestrictionIcon';
export const MediaViewerVideoRestriction = ({ restriction, preview, forcePreview = false, onButtonClick, }) => {
    return (React.createElement("div", { className: "MediaViewerVideoRestriction" },
        React.createElement("div", { className: "MediaViewerVideoRestriction__background", style: {
                backgroundImage: (restriction.canPreview || forcePreview) && preview
                    ? `url(${preview})`
                    : undefined,
            } }),
        React.createElement("div", { className: cx('MediaViewerVideoRestriction__main', {
                'MediaViewerVideoRestriction__main--blur': restriction.isBlur,
            }) },
            React.createElement("div", { className: "MediaViewerVideoRestriction__wrapper" },
                React.createElement("div", { className: "MediaViewerVideoRestriction__icon" },
                    React.createElement(RestrictionIcon, { name: restriction.iconName, disclaimerType: restriction.disclaimerType })),
                React.createElement("h3", { className: "MediaViewerVideoRestriction__title" }, restriction.title),
                restriction.text && (React.createElement("div", { className: "MediaViewerVideoRestriction__text" }, restriction.text)),
                restriction.button && onButtonClick && (React.createElement("div", { className: "MediaViewerVideoRestriction__action" },
                    React.createElement(Button, { appearance: "overlay", onClick: () => onButtonClick?.(restriction.button?.action) }, restriction.button.title)))))));
};
//# sourceMappingURL=MediaViewerVideoRestriction.js.map