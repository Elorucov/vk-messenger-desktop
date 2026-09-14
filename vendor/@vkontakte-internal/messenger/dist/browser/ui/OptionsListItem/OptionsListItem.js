import '../../ui/OptionsListItem/OptionsListItem.css';
import React from 'react';
import cx from 'classnames';
import { Icon28ChevronRightOutline } from '@vkontakte/icons';
export const OptionsListItem = ({ icon, title, description, aside, isPadded = true, isInteractive, hasChevron, hasIconBackground, onClick, className, }) => {
    return (React.createElement(OptionsListItemWrapper, { onClick: onClick, isInteractive: isInteractive, className: className, isPadded: isPadded },
        React.createElement("div", { className: cx('OptionsListItem__icon', {
                'OptionsListItem__icon--withBG': hasIconBackground,
            }), "aria-hidden": true }, icon),
        React.createElement("div", { className: "OptionsListItem__main" },
            React.createElement("div", { className: "OptionsListItem__title" }, title),
            description && (React.createElement("div", { className: "OptionsListItem__description" }, description))),
        hasChevron && (React.createElement("div", { className: "OptionsListItem__aside OptionsListItem__aside--chevron" },
            React.createElement(Icon28ChevronRightOutline, null))),
        aside && React.createElement("div", { className: "OptionsListItem__aside" }, aside)));
};
function handleMouseDown(e) {
    e.preventDefault();
}
export const OptionsListItemWrapper = ({ children, className, isInteractive, isPadded = true, onClick }) => {
    const classNames = cx('OptionsListItem', className, {
        'OptionsListItem--interactive': isInteractive ?? onClick,
        'OptionsListItem--padded': isPadded,
    });
    return (React.createElement("li", { className: classNames, onClick: onClick, tabIndex: onClick ? 0 : undefined, onMouseDown: onClick ? handleMouseDown : undefined }, children));
};
//# sourceMappingURL=OptionsListItem.js.map