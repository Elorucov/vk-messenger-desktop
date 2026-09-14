import '../../ui/ModalPanel/ModalPanel.css';
import React, { useContext } from 'react';
import cx from 'classnames';
import { ModalConfigContext } from '../../ui/ModalConfigProvider/ModalConfigProvider';
export const ModalPanel = ({ children, className, topRight, size, ariaLabelledby, }) => {
    const { isFullScreen } = useContext(ModalConfigContext);
    const classNames = cx('RE_ModalPanel', className, {
        'RE_ModalPanel--fullScreen': isFullScreen,
    });
    return (React.createElement("article", { className: classNames, style: size ? { width: size.width, height: size.height } : {}, role: "dialog", "aria-modal": true, "aria-labelledby": ariaLabelledby },
        children,
        topRight && React.createElement("div", { className: "RE_ModalPanel__TopRight" }, topRight)));
};
//# sourceMappingURL=ModalPanel.js.map