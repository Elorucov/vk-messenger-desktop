import React from 'react';
import { Icon20GlobeCrossOutline, Icon56GlobeCrossOutline, } from '@vkontakte/icons';
import { Button } from '@vkontakte/vkui';
import { useBrowserEnv } from '../../hooks/misc';
import './FailedRequest.css';
import { classNames } from '@vkontakte/vkjs';
export const FailedRequest = ({ text, reloadText, onReloadClick, size = 'm', align = 'left', }) => {
    const { lang } = useBrowserEnv();
    return (React.createElement("div", { className: classNames('FailedRequest', `FailedRequest--size-${size}`, `FailedRequest--align-${align}`) },
        React.createElement("div", { className: "FailedRequest__content" },
            size === 'm' ? (React.createElement(Icon56GlobeCrossOutline, { className: "FailedRequest__icon" })) : (React.createElement(Icon20GlobeCrossOutline, { className: "FailedRequest__icon" })),
            React.createElement("div", { className: "FailedRequest__desc" }, text),
            onReloadClick && (React.createElement(Button, { className: "FailedRequest__action", onClick: onReloadClick }, reloadText ?? lang.use('me_failed_request_try_again'))))));
};
//# sourceMappingURL=FailedRequest.js.map