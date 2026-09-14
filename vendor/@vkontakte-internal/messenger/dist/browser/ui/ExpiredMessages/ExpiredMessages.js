import '../../ui/ExpiredMessages/ExpiredMessages.css';
import React, { useId } from 'react';
import { Icon20BombOutline } from '@vkontakte/icons';
import { useBrowserEnv } from '../../hooks/misc';
import cx from 'classnames';
export const ExpiredMessages = ({ count, isThemed, isNavigating, }) => {
    const { lang } = useBrowserEnv();
    const id = useId();
    const previewId = `${id}preview`;
    return (React.createElement("article", { "aria-describedby": previewId, tabIndex: -1, className: cx('ExpiredMessage', {
            'ExpiredMessage--themed': isThemed,
            'ExpiredMessage--navigating': isNavigating,
        }) },
        React.createElement("div", { role: "presentation", className: "ExpiredMessage__container" },
            React.createElement("div", { role: "presentation", className: "ExpiredMessage__icon" },
                React.createElement(Icon20BombOutline, { "aria-hidden": "true", focusable: false })),
            React.createElement("div", { id: previewId, role: "presentation", className: "ExpiredMessage__text" }, count === 1
                ? lang.use('me_one_message_expired')
                : lang.use('me_messages_expired', { num: count })))));
};
//# sourceMappingURL=ExpiredMessages.js.map