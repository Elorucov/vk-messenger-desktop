import { ScrollbarProvider, } from '@vkontakte-internal/scrollbar';
import '../../ui/ModalBody/ModalBody.css';
import React, { useContext } from 'react';
import cx from 'classnames';
import { ModalConfigContext } from '../../ui/ModalConfigProvider/ModalConfigProvider';
export const ModalBody = ({ children, withCustomLayout, withScrollHandling, scrollbarProps, isDark, }) => {
    const { isFullScreen } = useContext(ModalConfigContext);
    const classNames = cx('RE_ModalBody', {
        'RE_ModalBody--fullScreen': isFullScreen,
        'RE_ModalBody--dark': isDark,
    });
    if (!withScrollHandling) {
        return (React.createElement("div", { className: cx(classNames, {
                'RE_ModalBody--standard': !withCustomLayout,
            }) }, children));
    }
    return (React.createElement(ScrollbarProvider, { className: classNames, scrollableProps: {
            className: cx({
                'RE_ModalBody--standard': !withCustomLayout,
            }),
            ...scrollbarProps?.scrollableProps,
        }, contentProps: {
            className: 'RE_ModalBody__scrollbar-content',
            ...scrollbarProps?.contentProps,
        } }, children));
};
//# sourceMappingURL=ModalBody.js.map