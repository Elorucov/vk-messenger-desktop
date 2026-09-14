import { jsx as _jsx } from "react/jsx-runtime";
import { classNames } from '@vkontakte/vkjs';
import { useExternRef } from '@vkontakte-internal/react-utils';
import { useMemo, useRef } from 'react';
import { FocusTrap } from '../../FocusTrap/FocusTrap';
import { ModalBoxChevron } from './ModalBoxChevron/ModalBoxChevron';
import { ModalBoxContextProvider } from './ModalBoxContext';
import styles from './ModalBox.module.css';
const ModalBoxComponent = ({ getRef, width, height, maxWidth, maxHeight, stretched, focusTrap, style, className, children, ['aria-labelledby']: labelledBy, ...restProps }) => {
    const rootRef = useRef(null);
    const modalRef = useExternRef(getRef, rootRef);
    const context = useMemo(() => ({
        stretched,
        setHeaderId(id) {
            if (labelledBy)
                return;
            id
                ? rootRef.current?.setAttribute('aria-labelledby', id)
                : rootRef.current?.removeAttribute('aria-labelledby');
        },
    }), [stretched, labelledBy]);
    const box = (_jsx(ModalBoxContextProvider, { value: context, children: _jsx("div", { "data-testid": "modalbox", ref: modalRef, "aria-modal": true, role: "dialog", style: {
                ...style,
                width: width ?? style?.width,
                maxWidth: maxWidth ?? style?.maxWidth,
                height: height ?? style?.height,
                maxHeight: maxHeight ?? style?.maxHeight,
            }, className: classNames(styles.container, stretched && styles.containerStretched, 'vkuiInternalModalBox', className), "aria-labelledby": labelledBy, ...restProps, children: children }) }));
    if (focusTrap) {
        return _jsx(FocusTrap, { autoFocus: true, children: box });
    }
    return box;
};
export const ModalBox = Object.assign(ModalBoxComponent, {
    Chevron: ModalBoxChevron,
});
//# sourceMappingURL=ModalBox.js.map