import '../../ui/ConvoListBanner/ConvoListBanner.css';
import React from 'react';
import { classNames as cx } from '@vkontakte/vkjs';
import { Icon24ChevronCompactRight } from '@vkontakte/icons';
import { Subhead } from '@vkontakte-internal/vkcom-kit';
export const ConvoListBanner = ({ className, icon, title, subtitle, children, onClick, }) => {
    return (React.createElement("div", { className: cx('ConvoListBanner', className), onClick: onClick },
        React.createElement("div", { className: "ConvoListBanner__content" },
            icon && React.createElement("div", null, icon),
            React.createElement("div", null,
                React.createElement("div", { className: "ConvoListBanner__title" }, title),
                subtitle && (React.createElement(Subhead, { className: "ConvoListBanner__subtitle" }, subtitle)))),
        React.createElement("div", { className: "ConvoListBanner__info" },
            children,
            React.createElement("div", { className: "ConvoListBanner__arrow" },
                React.createElement(Icon24ChevronCompactRight, null)))));
};
//# sourceMappingURL=ConvoListBanner.js.map