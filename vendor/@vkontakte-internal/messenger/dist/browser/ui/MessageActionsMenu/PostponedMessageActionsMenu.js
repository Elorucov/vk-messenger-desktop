import React, { useCallback, useMemo } from 'react';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
import * as Convo from '../../../core/model/Convo';
import * as Message from '../../../core/model/Message';
import { useBrowserEnv, useConvo, useDispatch } from '../../hooks/misc';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { Icon20CheckCircleOutline, Icon20DeleteOutline, Icon20WriteOutline, Icon24SendOutline, Icon20RecentOutline, Icon24ErrorCircleOutline, } from '@vkontakte/icons';
import { CommonCopyMessageTextAction } from '../../ui/MessageActionsMenu/CommonCopyMessageTextAction';
import { useRouter } from '../../ui/Router/Router';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useNow } from '../../hooks/useNow';
export const PostponedMessageActionsMenu = ({ message, peerId, openCalendarModal, openDeleteMessageModal, onSelect, }) => {
    const dispatch = useDispatch();
    const { navigate } = useRouter();
    const { lang } = useBrowserEnv();
    const now = useNow();
    const snackbar = useSnackbar();
    const convo = useConvo(peerId);
    const convoPostponedPermissions = Convo.postponedMessagingPermissions(convo);
    const hasError = Message.isFailed(message);
    const isEditable = Message.isEditable(message, now);
    const handleAction = useCallback((userAction) => {
        switch (userAction) {
            case 'delete': {
                openDeleteMessageModal();
                break;
            }
            case 'select': {
                if (onSelect) {
                    onSelect(message, 'via-actions-menu');
                }
                break;
            }
            case 'send_now': {
                dispatch({
                    type: 'UserHitSendPostponedRightNow',
                    peerId,
                    cmid: message.cmid,
                    onErrorUICallback: (errorDescription) => snackbar({
                        before: (React.createElement(Icon24ErrorCircleOutline, { color: "var(--vkui--color_text_negative)" })),
                        message: errorDescription,
                    }),
                });
                navigate({
                    kind: 'ConvoRoute',
                    peerId,
                    entrypoint: 'postponed_messages',
                });
                break;
            }
            case 'change_time': {
                openCalendarModal();
                break;
            }
            case 'edit': {
                dispatch({
                    type: 'UserChangedComposerDraft',
                    kind: 'editing',
                    editing: message,
                    peerId,
                    isPostponed: true,
                });
                break;
            }
            default:
                exhaustivenessCheck(userAction);
        }
    }, [
        dispatch,
        message,
        peerId,
        onSelect,
        navigate,
        openCalendarModal,
        openDeleteMessageModal,
        snackbar,
    ]);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        convoPostponedPermissions.isSendingPostponedAvailable && (React.createElement(React.Fragment, null,
            isEditable && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20WriteOutline, null), title: lang.use('me_message_action_edit'), onClick: () => handleAction('edit'), type: "secondary" })),
            !hasError && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon24SendOutline, { width: 20, height: 20 }), title: lang.use('me_message_action_send_now'), onClick: () => handleAction('send_now'), type: "secondary" })),
            React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20RecentOutline, null), title: lang.use('me_message_action_change_sending_time'), onClick: () => handleAction('change_time'), type: "secondary" }))),
        React.createElement(CommonCopyMessageTextAction, { chunks: message.chunks }),
        React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20DeleteOutline, null), title: lang.use('me_message_action_delete'), onClick: () => handleAction('delete'), type: "danger" }),
        React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20CheckCircleOutline, null), title: lang.use('me_select_message'), onClick: () => handleAction('select'), type: "secondary" }))), [
        convoPostponedPermissions.isSendingPostponedAvailable,
        hasError,
        lang,
        message.chunks,
        handleAction,
        isEditable,
    ]);
    return React.createElement(ActionsMenu, null, actionsList);
};
//# sourceMappingURL=PostponedMessageActionsMenu.js.map