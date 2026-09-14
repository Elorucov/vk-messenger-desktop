import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useModal } from '../hooks/useModal';
import { ForeignMessagesHistoryModal } from '../ui/ForeignMessagesHistory/ForeignMessagesHistory';
import * as Message from '../../core/model/Message';
import { useFeatureFlags, useInsertIntoCache } from './misc';
import { useFetchFullMessage } from './useFetchFullMessage';
export function useForeignMessagesHistoryModal({ goToMessage, openClipCoOwnersModal, }) {
    const insertIntoCache = useInsertIntoCache();
    const { isLoading, isError, fetchFullMessage } = useFetchFullMessage();
    const [messagesStack, setMessagesStack] = useState([]);
    const message = messagesStack[messagesStack.length - 1];
    const [rootMessage, setRootMessage] = useState(null);
    const { close, open, isActive } = useModal();
    const featureFlags = useFeatureFlags();
    const handleMessageUpdate = useCallback(async (rootMessage) => {
        const { apiMessage, fullRootMessage } = await fetchFullMessage(rootMessage.cmid, rootMessage.peerId);
        if (!apiMessage || !fullRootMessage) {
            return;
        }
        insertIntoCache({ messages: [apiMessage] });
        setMessagesStack((prev) => [
            ...prev.slice(0, -1),
            fullRootMessage.forwardedMessages[0],
        ]);
        setRootMessage(fullRootMessage);
    }, [fetchFullMessage, insertIntoCache]);
    const handleOpen = useCallback(({ message, rootMessage }) => {
        setMessagesStack((prev) => [...prev, message]);
        setRootMessage(rootMessage);
        if (!isActive) {
            open();
        }
        if (featureFlags.vkm_nested_level_messages) {
            // Если есть недозагружунные сообщения, то их нужно загрузить
            if (rootMessage.nestedMsgsHasMore &&
                Message.isMessageNormal(rootMessage)) {
                handleMessageUpdate(rootMessage);
            }
        }
    }, [
        open,
        isActive,
        handleMessageUpdate,
        featureFlags.vkm_nested_level_messages,
    ]);
    const refetchFullMessage = useCallback(() => {
        if (!rootMessage || !Message.isMessageNormal(rootMessage)) {
            return;
        }
        handleMessageUpdate(rootMessage);
    }, [handleMessageUpdate, rootMessage]);
    const handleBack = useCallback(() => {
        setMessagesStack((prev) => {
            return prev.slice(0, -1);
        });
    }, []);
    const handleClose = useCallback(() => {
        close();
        setMessagesStack([]);
        setRootMessage(null);
    }, [close]);
    useEffect(() => {
        if (messagesStack.length === 0) {
            handleClose();
        }
    }, [handleClose, messagesStack.length]);
    const isBackVisible = messagesStack.length > 1;
    const Modal = useMemo(() => {
        if (!message || !rootMessage || !isActive) {
            return null;
        }
        return (React.createElement(ForeignMessagesHistoryModal, { onClose: handleClose, onOpen: handleOpen, onBack: handleBack, isBackVisible: isBackVisible, onGoToMessage: goToMessage, openClipCoOwnersModal: openClipCoOwnersModal, message: message, rootMessage: rootMessage, isLoading: isLoading, isError: isError, refetchFullMessage: refetchFullMessage }));
    }, [
        handleBack,
        handleClose,
        handleOpen,
        goToMessage,
        isActive,
        message,
        rootMessage,
        isBackVisible,
        openClipCoOwnersModal,
        isLoading,
        isError,
        refetchFullMessage,
    ]);
    return {
        ForwardedMessageModal: Modal,
        isActive,
        close: handleClose,
        open: handleOpen,
    };
}
//# sourceMappingURL=useForeignMessagesHistoryModal.js.map