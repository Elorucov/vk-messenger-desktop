import React, { useLayoutEffect, useState } from 'react';
import { useModal, useModalGroup } from '../../hooks/useModal';
import { InputContactModal, } from '../../ui/ImportContactModal/InputContactModal';
import { InviteContactModal } from '../../ui/ImportContactModal/InviteContactModal';
import '../../ui/ImportContactModal/ImportContactModal.css';
/**
 * Компонент-контейнер, управляющий двумя модалками.
 */
export const ImportContactModal = ({ onClose, }) => {
    const importContactGroup = useModalGroup();
    const inputModal = useModal(importContactGroup.id);
    const inviteModal = useModal(importContactGroup.id);
    const [contactPhone, setContactPhone] = useState(null);
    const [initialFormData, setInitialFromData] = useState({
        name: '',
        surname: '',
        phone: '',
    });
    useLayoutEffect(() => {
        inputModal.open();
        return () => {
            importContactGroup.closeGroup();
        };
        // Mодалка импорта должна открываться только один раз при маунте компонента
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React.createElement(React.Fragment, null,
        inputModal.isActive && (React.createElement(InputContactModal, { initialData: initialFormData, openInviteModal: inviteModal.open, onClose: onClose, setContactPhone: setContactPhone, onFromChange: setInitialFromData })),
        inviteModal.isActive && contactPhone && (React.createElement(InviteContactModal, { contactPhone: contactPhone, onClose: onClose, onBack: inviteModal.close }))));
};
//# sourceMappingURL=ImportContactModal.js.map