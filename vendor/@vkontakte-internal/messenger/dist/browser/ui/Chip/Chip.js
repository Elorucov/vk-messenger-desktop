import React from 'react';
import { Icon16Cancel } from '@vkontakte/icons';
import './Chip.css';
import cx from 'classnames';
import { useBrowserEnv } from '../../hooks/misc';
import { VisuallyHidden } from '@vkontakte-internal/vkcom-kit';
export const Chip = ({ name, avatar, onRemove, className, fullName, }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: cx('Chip', className) },
        React.createElement("div", { className: "Chip__content" },
            avatar,
            React.createElement("div", { className: "Chip__name", tabIndex: 0 },
                React.createElement("span", { "aria-hidden": "true" }, name),
                React.createElement(VisuallyHidden, null, fullName))),
        onRemove && (React.createElement("button", { "aria-label": lang.use('me_remove'), className: "Chip__remove", onClick: onRemove },
            React.createElement(Icon16Cancel, null)))));
};
//# sourceMappingURL=Chip.js.map