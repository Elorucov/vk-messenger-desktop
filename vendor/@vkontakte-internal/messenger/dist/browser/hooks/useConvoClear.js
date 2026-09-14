import React, { useMemo, useCallback, useRef } from 'react';
import { useBrowserEnv, useDispatch } from './misc';
import { useModal } from '../hooks/useModal';
import { useRouter } from '../ui/Router/Router';
import { AlertInterface, } from '../ui/AlertInterface/AlertInterface';
export function useConvoClear() {
    const { lang } = useBrowserEnv();
    const { screenRoute, navigate } = useRouter();
    const dispatch = useDispatch();
    const confirmModal = useModal();
    const convoToClear = useRef(null);
    const handleConvoClearAction = useCallback((convo) => {
        convoToClear.current = convo;
        confirmModal.open();
    }, [confirmModal]);
    const handleModalClose = useCallback(() => {
        convoToClear.current = null;
        confirmModal.close();
    }, [confirmModal]);
    const handleModalSubmit = useCallback(() => {
        if (!convoToClear.current) {
            return;
        }
        dispatch({
            type: 'UserChangedConvo',
            peerId: convoToClear.current.peerId,
            userAction: 'clear',
        });
        confirmModal.close();
        // Если находимся на странице чата, который очищаем
        if (screenRoute.kind === 'ConvoRoute' &&
            screenRoute.peerId === convoToClear.current.peerId) {
            navigate({ kind: 'MainRoute' });
        }
        convoToClear.current = null;
    }, [dispatch, confirmModal, navigate, screenRoute]);
    const actions = useMemo(() => [
        {
            title: lang.use('me_cancel'),
            autoClose: true,
            mode: 'cancel',
        },
        {
            title: lang.use('me_remove'),
            mode: 'destructive',
            autoCloseDisabled: true,
            action: handleModalSubmit,
        },
    ], [lang, handleModalSubmit]);
    const ConfirmModal = useMemo(() => confirmModal.isActive && (React.createElement(AlertInterface, { onClose: handleModalClose, contextClass: "MEConfig", title: lang.use('me_clear_chat_confirm_title'), actions: actions, description: React.createElement("span", { style: { whiteSpace: 'break-spaces' } }, 
        /**
         * @todo Заменить на новый ключ или оставить как есть в случае
         * переделки модалки.
         */
        lang.use(convoToClear.current?.kind === 'GroupConvo'
            ? 'me_clear_group_chat_confirm_text'
            : 'me_clear_chat_confirm_text', {
            values: {
                b: (text) => text,
            },
        })) })), [lang, confirmModal, actions, handleModalClose]);
    return {
        ConvoClearConfirmModal: ConfirmModal,
        handleConvoClearAction,
    };
}
//# sourceMappingURL=useConvoClear.js.map