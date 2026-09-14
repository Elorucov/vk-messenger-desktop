import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"CustomScrollView":["Adopted",{"className":1}]} */
import { classNames } from '@vkontakte/vkjs';
import { useExternRef } from '@vkontakte-internal/react-utils';
import { CustomScrollView } from '../../Adopted';
import styles from './ModalScrollView.module.css';
export function ModalScrollView({ children, scrollViewClassName, style, height, maxHeight, autoHideScrollbar, getRef: externalRef, getRootRef: externalRootRef, ...restProps }) {
    const rootRef = useExternRef(externalRootRef);
    const boxRef = useExternRef(rootRef, externalRef);
    const maxHeightStyle = maxHeight
        ? {
            '--max-height-scroll': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
        : {};
    return (_jsx("div", { ref: rootRef, ...restProps, style: { ...style, height, ...maxHeightStyle }, children: _jsx(CustomScrollView, { boxRef: boxRef, className: classNames(scrollViewClassName, styles.scroll), windowResize: true, autoHideScrollbar: autoHideScrollbar, children: children }) }));
}
//# sourceMappingURL=ModalScrollView.js.map