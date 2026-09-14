import React, { memo } from 'react';
import { Portal } from '../../ui/Portal/Portal';
import './SnackbarContainer.css';
export const SnackbarContainer = ({ withPortal = true, portalProps = {
    portalClassName: 'MEConfig SnackbarModal',
}, children, }) => {
    return (React.createElement(WithPortal, { withPortal: withPortal, portalProps: portalProps },
        React.createElement("div", { className: "SnackbarContainer" }, children)));
};
const WithPortal = memo(({ withPortal, children, portalProps }) => {
    if (withPortal) {
        return React.createElement(Portal, { ...portalProps }, children);
    }
    return React.createElement(React.Fragment, null, children);
});
//# sourceMappingURL=SnackbarContainer.js.map