import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useDocumentKeyDown } from '../../hooks';
import { PopoutWrapper, useScrollLock } from '@vkontakte-internal/vkcom-kit';
import { KeyboardCodes } from '../../constants';
export function ModalBackdrop({ children, isEnabledBodyScrollBlocker, isDisabledEscapeClose, onClose, zIndex = 'var(--calls-modal-z-index, 1002)', }) {
    const onDocumentEscapeKeyDown = useCallback((event) => {
        if (event.key === KeyboardCodes.Escape) {
            onClose?.();
        }
    }, [onClose]);
    useDocumentKeyDown({ isDisabled: isDisabledEscapeClose, onKeyDown: onDocumentEscapeKeyDown });
    useScrollLock(isEnabledBodyScrollBlocker);
    return (_jsx(PopoutWrapper, { onClick: onClose, zIndex: zIndex, children: children }));
}
//# sourceMappingURL=ModalBackdrop.js.map