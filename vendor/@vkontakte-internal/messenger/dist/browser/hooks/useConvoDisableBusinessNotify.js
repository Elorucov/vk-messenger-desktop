import React, { useMemo, useCallback, useRef } from 'react';
import { useBrowserEnv, useDispatch } from './misc';
import { useModal } from '../hooks/useModal';
import { AlertInterface, } from '../ui/AlertInterface/AlertInterface';
export function useConvoDisableBusinessNotify() {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const confirmModal = useModal();
    const $convo = useRef(null);
    const handleConvoDisableBusinessNotifyAction = useCallback((convo) => {
        $convo.current = convo;
        confirmModal.open();
    }, [confirmModal]);
    const handleModalClose = useCallback(() => {
        // Переносим очистку конвы на следующий цикл, так как внутри VKUIAlert вызов onClose идет перед основным действием
        // Поведение исправлено в @vkontakte/vkui 6.7.0, при апе до этой версии setTimeout можно убрать
        setTimeout(() => {
            $convo.current = null;
        }, 0);
        confirmModal.close();
    }, [confirmModal]);
    const handleModalSubmit = useCallback(() => {
        if (!$convo.current ||
            $convo.current.kind !== 'BusinessNotify' ||
            $convo.current.ownerId === undefined) {
            return;
        }
        dispatch({
            type: 'UserChangedBusinessNotify',
            peerId: $convo.current.ownerId,
            userAction: 'business_notify_disable',
        });
        confirmModal.close();
        $convo.current = null;
    }, [dispatch, confirmModal]);
    const actions = useMemo(() => [
        {
            title: lang.use('me_cancel'),
            autoClose: true,
            mode: 'cancel',
        },
        {
            title: lang.use('me_disable_business_notify_confirm_action'),
            mode: 'destructive',
            action: handleModalSubmit,
        },
    ], [lang, handleModalSubmit]);
    const ConfirmModal = useMemo(() => confirmModal.isActive && (React.createElement(AlertInterface, { onClose: handleModalClose, contextClass: "MEConfig", title: lang.use('me_disable_business_notify_confirm_title'), actions: actions, description: React.createElement("p", { style: { maxWidth: 360 } }, lang.use('me_disable_business_notify_confirm_text')) })), [lang, confirmModal, actions, handleModalClose]);
    return {
        ConvoDisableBusinessNotifyModal: ConfirmModal,
        handleConvoDisableBusinessNotifyAction,
    };
}
//# sourceMappingURL=useConvoDisableBusinessNotify.js.map