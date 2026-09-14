import React, { useMemo, useCallback, useState } from 'react';
import { useModal } from '../hooks/useModal';
import { ForeignMessageModal } from '../ui/ForeignMessageModal/ForeignMessageModal';
import { NormalMessageModal } from '../ui/NormalMessageModal/NormalMessageModal';
import { exhaustivenessCheck } from '../../core/utils/misc';
export const useMessageModal = ({ openClipCoOwnersModal, }) => {
    const modal = useModal();
    const [message, setMessage] = useState(null);
    const [rootMessage, setRootMessage] = useState(null);
    const handleOpenMessageModal = useCallback((params) => {
        setMessage(params.message);
        if (params.message.kind === 'Foreign' && params.rootMessage) {
            setRootMessage(params.rootMessage);
        }
        modal.open();
    }, [modal]);
    const handleCloseMessageModal = useCallback(() => {
        setMessage(null);
        modal.close();
    }, [modal]);
    const MessageModal = useMemo(() => {
        if (!message || !modal.isActive) {
            return null;
        }
        switch (message.kind) {
            case 'Normal':
            case 'Queued':
                return (React.createElement(NormalMessageModal, { message: message, onClose: handleCloseMessageModal, openClipCoOwnersModal: openClipCoOwnersModal }));
            case 'Foreign': {
                if (!rootMessage) {
                    return null;
                }
                return (React.createElement(ForeignMessageModal, { message: message, rootMessage: rootMessage, onClose: handleCloseMessageModal }));
            }
            default:
                exhaustivenessCheck(message);
        }
    }, [
        message,
        modal.isActive,
        handleCloseMessageModal,
        rootMessage,
        openClipCoOwnersModal,
    ]);
    return {
        MessageModal: MessageModal,
        openMessageModal: handleOpenMessageModal,
        closeMessageModal: handleCloseMessageModal,
    };
};
//# sourceMappingURL=useMessageModal.js.map