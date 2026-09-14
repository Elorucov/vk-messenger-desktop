import React, { forwardRef } from 'react';
import cx from 'classnames';
import { Icon12Play, Icon12Spinner } from '@vkontakte/icons';
import './PopupIcon.css';
export const PopupIcon = forwardRef(({ isLoading, inset }, ref) => {
    return (React.createElement("div", { className: cx('PopupIcon__wrapper', {
            'PopupIcon__wrapper--withTransparentBg': !inset,
        }), ref: ref }, isLoading ? (React.createElement("div", { className: "PopupIcon__rotated" },
        React.createElement(Icon12Spinner, null))) : (React.createElement(Icon12Play, null))));
});
//# sourceMappingURL=PopupIcon.js.map