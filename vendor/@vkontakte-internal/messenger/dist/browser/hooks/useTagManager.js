import React, { useMemo, useCallback, useState } from 'react';
import { useModal } from '../hooks/useModal';
import { TagManagerModal } from '../ui/TagManagerModal';
export function useTagManager() {
    const tagManagerModal = useModal();
    const [tagManagerPeerId, setTagManagerPeerId] = useState();
    const onClose = useCallback(() => {
        setTagManagerPeerId(undefined);
        tagManagerModal.close();
    }, [tagManagerModal]);
    return {
        onClose,
        onOpen: useCallback((peerId) => {
            setTagManagerPeerId(peerId);
            tagManagerModal.open();
        }, [tagManagerModal]),
        tagManagerModal: useMemo(() => tagManagerModal.isActive && (React.createElement(TagManagerModal, { onClose: onClose, peerId: tagManagerPeerId })), [tagManagerModal.isActive, onClose, tagManagerPeerId]),
    };
}
//# sourceMappingURL=useTagManager.js.map