import React, { useMemo, useCallback, useRef, useState } from 'react';
import { useModal } from '../hooks/useModal';
import * as Peer from '../../core/model/Peer';
import { AlertInterface, } from '../ui/AlertInterface/AlertInterface';
import { useBrowserEnv, useFeatureFlags, useOwner } from '../hooks/misc';
import { getOwnerGroupId } from '../../data/store/State';
import { useSnackbar } from '../hooks/useSnackbar';
import { useRouter } from '../ui/Router/Router';
import { Button } from '@vkontakte/vkui';
import { SnackbarTimer } from '../ui/SnackbarTimer/SnackbarTimer';
import { useApiFetch } from '../hooks/useApiFetch';
// Время которое даем пользователю на отмену действия (удаления чата)
const SNACKBAR_DURATION = 5000;
export function useConvoDelete() {
    const { lang } = useBrowserEnv();
    const confirmModal = useModal();
    const owner = useOwner();
    const { replace, screenRoute } = useRouter();
    const { vkm_chat_restore } = useFeatureFlags();
    const apiFetch = useApiFetch();
    const convoPeerId = useRef(null);
    const [loading, setLoading] = useState(false);
    const snackbar = useSnackbar();
    const onDelete = useCallback((peerId) => {
        convoPeerId.current = peerId;
        confirmModal.open();
    }, [confirmModal]);
    const onDeleteConfirmationRejection = useCallback(() => {
        confirmModal.close();
    }, [confirmModal]);
    const restoreConvo = useCallback(async () => {
        if (!convoPeerId.current) {
            return;
        }
        try {
            await apiFetch('messages.restoreChatForAll', {
                chat_id: Peer.toRealId(convoPeerId.current),
                group_id: getOwnerGroupId(owner.id),
            });
        }
        catch {
            snackbar({
                message: lang.use('me_chat_restoration_failed'),
            });
        }
    }, [apiFetch, lang, owner.id, snackbar]);
    const onDeleteConfirmation = useCallback(async () => {
        if (!convoPeerId.current) {
            return;
        }
        setLoading(true);
        try {
            await apiFetch('messages.dropChatForAll', {
                chat_id: Peer.toRealId(convoPeerId.current),
                group_id: getOwnerGroupId(owner.id),
            });
            // Если у нас открыт удаленный чат, закрываем его
            if (screenRoute.kind === 'ConvoRoute' &&
                screenRoute.peerId === convoPeerId.current) {
                replace({ kind: 'MainRoute' });
            }
            const confirmId = snackbar({
                before: vkm_chat_restore ? React.createElement(SnackbarTimer, { mode: "dark" }) : null,
                mode: 'dark',
                message: lang.use('me_chat_deleted'),
                after: vkm_chat_restore ? (React.createElement(Button, { mode: "tertiary", appearance: "accent-invariable", size: "s", onClick: () => {
                        restoreConvo();
                        snackbar.close(confirmId);
                    } }, lang.use('me_chat_deleted_cancel'))) : null,
                duration: SNACKBAR_DURATION,
                stopOnHover: false,
                onClose: () => {
                    convoPeerId.current = null;
                },
            });
        }
        catch {
            snackbar({
                message: lang.use('me_chat_delete_failed'),
            });
        }
        confirmModal.close();
        setLoading(false);
    }, [
        apiFetch,
        owner.id,
        confirmModal,
        screenRoute,
        snackbar,
        lang,
        replace,
        restoreConvo,
        vkm_chat_restore,
    ]);
    const actions = useMemo(() => [
        {
            title: lang.use('me_cancel'),
            autoClose: true,
            mode: 'cancel',
        },
        {
            title: lang.use('me_remove'),
            mode: 'destructive',
            action: onDeleteConfirmation,
            loading,
        },
    ], [lang, onDeleteConfirmation, loading]);
    const ConfirmModal = useMemo(() => confirmModal.isActive && (React.createElement(AlertInterface, { onClose: onDeleteConfirmationRejection, contextClass: "MEConfig", title: lang.use('me_delete_chat_confirm_title'), actions: actions, description: lang.use('me_delete_chat_confirm') })), [lang, confirmModal, actions, onDeleteConfirmationRejection]);
    return {
        ConvoDeleteConfirmModal: ConfirmModal,
        handleConvoDeleteAction: onDelete,
    };
}
//# sourceMappingURL=useConvoDelete.js.map