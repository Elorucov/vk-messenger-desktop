import { useModal } from '../hooks/useModal';
import React, { useRef, useCallback } from 'react';
import { MRRejectConfirmationModal } from '../ui/MRRejectConfirmationModal/MRRejectConfirmationModal';
export const useMRReject = (route, closeConvo) => {
    const rejectMRConfirmationModal = useModal();
    // Используем реф, чтобы сохранить анимацию закрытия модалки, когда она появится.
    const selectedMRConvoRef = useRef();
    const onRejectMR = useCallback((convo) => {
        selectedMRConvoRef.current = convo;
        rejectMRConfirmationModal.open();
    }, [rejectMRConfirmationModal]);
    const handleReject = useCallback(() => {
        if (route.kind === 'ConvoRoute' &&
            route.peerId === selectedMRConvoRef.current?.peerId) {
            closeConvo();
        }
        selectedMRConvoRef.current = undefined;
    }, [route, closeConvo]);
    return {
        onRejectMR,
        rejectMRConfirmationModal: rejectMRConfirmationModal.isActive &&
            selectedMRConvoRef.current !== undefined && (React.createElement(MRRejectConfirmationModal, { peerId: selectedMRConvoRef.current.peerId, onClose: rejectMRConfirmationModal.close, onReject: handleReject })),
    };
};
//# sourceMappingURL=useMRReject.js.map