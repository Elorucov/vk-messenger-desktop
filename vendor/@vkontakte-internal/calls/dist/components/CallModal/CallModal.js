import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useTypedDispatch } from '../../hooks/useTypedDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { BaseModal } from '../../palette/BaseModal/BaseModal';
import { usePseudoLayer } from '../../services/hooks';
import { E_ACTION } from '../../constants';
import { classNames as cx } from '@vkontakte/vkjs';
import { getIsModalOpened } from '../../selectors';
export const CallModal = ({ onClose, onBackdropClick, isIncoming = false, shouldConfirmClosing = false, className: addedClassName, children, priority = 'default', }) => {
    const dispatch = useTypedDispatch();
    const className = cx('CallModal', 'CallModal--withAnimation', priority === 'low' && 'CallModal--priority_low', addedClassName);
    const isAnotherModalOpened = useTypedSelector(getIsModalOpened);
    usePseudoLayer();
    const handleCloseModal = useCallback(() => {
        if (isAnotherModalOpened) {
            return;
        }
        if (shouldConfirmClosing) {
            dispatch({
                type: E_ACTION.SHOW_CAUTION_BOX,
                isOpen: true,
                isIncoming: isIncoming || false,
            });
        }
        else {
            onClose();
        }
    }, [shouldConfirmClosing, onClose, isAnotherModalOpened]);
    return (_jsx(BaseModal, { className: className, disableBodyScroll: true, onClose: handleCloseModal, onBackdropClick: onBackdropClick, children: children }));
};
//# sourceMappingURL=CallModal.js.map