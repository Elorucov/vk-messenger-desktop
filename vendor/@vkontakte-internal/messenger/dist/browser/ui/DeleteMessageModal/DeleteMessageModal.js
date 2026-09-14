import React, { useCallback, useMemo, useState } from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { AlertInterface, } from '../../ui/AlertInterface/AlertInterface';
import { ReforgedCheckbox } from '../../ui/ReforgedCheckbox/ReforgedCheckbox';
export const DeleteMessageModal = ({ peerId, messages, handleModalClose, isPostponed, }) => {
    const { storage, lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const [isDeleteForAllChecked, setIsDeleteForAllChecked] = useState(() => !!storage.get('last-delete-message-for-all-option'));
    const toggleDeleteForAll = useCallback(() => {
        setIsDeleteForAllChecked((prevDeleteForAll) => {
            storage.set('last-delete-message-for-all-option', !prevDeleteForAll);
            return !prevDeleteForAll;
        });
    }, [storage]);
    const handleDeleteModalSubmit = useCallback(() => {
        if (isPostponed) {
            dispatch({
                type: 'UserDeletedPostponedMessage',
                messages,
                peerId: peerId,
                userAction: 'deletePostponed',
            });
        }
        else {
            dispatch({
                type: 'UserDeleteMessage',
                userAction: 'delete',
                messages,
                peerId: peerId,
                deleteType: isDeleteForAllChecked ? 'for_all' : 'local',
            });
        }
    }, [dispatch, isDeleteForAllChecked, messages, peerId, isPostponed]);
    const actions = useMemo(() => [
        {
            title: lang.use('me_cancel'),
            autoClose: true,
            mode: 'cancel',
        },
        {
            title: lang.use('me_message_action_delete'),
            mode: 'destructive',
            autoClose: true,
            action: handleDeleteModalSubmit,
        },
    ], [lang, handleDeleteModalSubmit]);
    return (React.createElement(AlertInterface, { contextClass: "MEConfig", title: lang.use('me_message_delete_modal_title'), description: React.createElement("div", null,
            React.createElement("div", null, 
            /**
             * @todo Заменить на новый ключ или оставить как есть.
             *
             * Было принято решение перенести всю историю с удалением
             * в контекстное меню - в переделанном компоненте
             * может (потенциально) использоваться этот ключ.
             *
             * @see https://jira.mvk.com/browse/ME-46199
             */
            lang.use('me_message_delete_modal_text', {
                values: {
                    bold: (text) => text,
                },
            })),
            !isPostponed && (React.createElement(ReforgedCheckbox, { onChange: toggleDeleteForAll, checked: isDeleteForAllChecked }, lang.use('me_message_delete_modal_checkbox')))), actions: actions, onClose: handleModalClose }));
};
//# sourceMappingURL=DeleteMessageModal.js.map