import * as React from 'react';
import { Icon } from '../Icon/Icon';
import { ActionButton } from '../Action/ActionButton';
const DEFAULT_TYPE = 'outline';
const allowedTypes = [DEFAULT_TYPE, 'primary', 'secondary', 'tertiary'];
// @elephizeTarget
export const Button = ({ title, icon, styles, action, className }) => {
    const iconStyles = icon && { icon: icon.style };
    const iconItems = icon && icon.items;
    let type = styles.type || '';
    type = type
        .replace('_with_icon', '')
        .replace('_icon', '')
        .replace('_text', '');
    if (!allowedTypes.includes(type)) {
        type = DEFAULT_TYPE;
    }
    const iconNode = icon ?
        React.createElement("span", { className: "SAKWidget__buttonIcon" },
            React.createElement(Icon, { widthPrior: 18, heightPrior: 18, items: iconItems, styles: iconStyles, meta: {} }))
        : null;
    const titleNode = title ? React.createElement("span", { className: "SAKWidget__buttonText" }, title) : null;
    const classNames = [
        'SAKWidget__button',
        `SAKWidget__button--type-${type}`,
    ];
    const contentClassNames = [
        'SAKWidget__buttonContent',
    ];
    if (icon) {
        contentClassNames.push('SAKWidget__buttonContent--icon');
    }
    if (className) {
        classNames.push(className);
    }
    return (React.createElement(ActionButton, { action: action, className: classNames.join(' ') },
        React.createElement("span", { className: contentClassNames.join(' ') },
            iconNode,
            titleNode)));
};
//# sourceMappingURL=Button.js.map