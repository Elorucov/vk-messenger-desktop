import React from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { RestrictionIcon } from '../../ui/RestrictionIcon/RestrictionIcon';
import { Button, ColorSchemeProvider } from '@vkontakte/vkui';
import './AttachRestriction.css';
export const AttachRestriction = ({ restriction, backgroundImage, width, height, small = false, }) => {
    // Если совсем ничего нет, то блокировка серьёзная и лучше показать текст вместо тайтла.
    // В этой ситуации он будет информативнее
    const showText = !restriction.disclaimerType &&
        !restriction.iconName &&
        !restriction.isBlur &&
        !small;
    const hasPreview = Boolean((restriction.canPreview || restriction.isBlur) && backgroundImage);
    return (React.createElement("div", { className: cx('AttachRestriction', { 'AttachRestriction--small': small }), style: { width, height } },
        React.createElement("div", { className: cx('AttachRestriction__background', restriction.isBlur && 'AttachRestriction__background--blur'), style: {
                backgroundImage: (restriction.canPreview || restriction.isBlur) && backgroundImage
                    ? `url(${backgroundImage})`
                    : undefined,
            } }),
        React.createElement("div", { className: cx('AttachRestriction__main', {
                'AttachRestriction__main--withPreview': hasPreview,
            }) },
            React.createElement("div", { className: "AttachRestriction__wrapper" },
                React.createElement("div", { className: "AttachRestriction__icon" },
                    React.createElement(RestrictionIcon, { name: restriction.iconName, disclaimerType: restriction.disclaimerType, small: small })),
                React.createElement("div", { className: "AttachRestriction__title" }, showText
                    ? restriction.text ?? restriction.title
                    : restriction.title),
                restriction.button && !small && (React.createElement("div", { className: "AttachRestriction__action" },
                    React.createElement(ColorSchemeProvider, { value: "dark" },
                        React.createElement(Button, { appearance: "neutral", mode: "secondary" }, restriction.button.title))))))));
};
//# sourceMappingURL=AttachRestriction.js.map