import '../../ui/NoResults/NoResults.css';
import React from 'react';
import { Icon56MessagesOutline } from '@vkontakte/icons';
import cx from 'classnames';
export const NoResults = React.memo(function NoResults({ children, icon = React.createElement(Icon56MessagesOutline, null), className, }) {
    return (React.createElement("div", { className: cx('NoResults', 'NoResults__flexGrow', className) },
        React.createElement("span", { className: "NoResults__icon" }, icon),
        React.createElement("div", { className: "NoResults__text" }, children)));
});
//# sourceMappingURL=NoResults.js.map