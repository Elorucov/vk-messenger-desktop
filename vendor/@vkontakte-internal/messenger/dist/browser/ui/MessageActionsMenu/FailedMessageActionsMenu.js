import React, { useCallback, useMemo } from 'react';
import * as Convo from '../../../core/model/Convo';
import { useBrowserEnv, useConvo, useDispatch } from '../../hooks/misc';
import { CommonCopySelectionAction } from '../../ui/MessageActionsMenu/CommonCopySelectionAction';
import { CommonCopyMessageTextAction } from '../../ui/MessageActionsMenu/CommonCopyMessageTextAction';
import { Icon20DeleteOutline, Icon20ArrowUpOutline, Icon20RecentOutline, } from '@vkontakte/icons';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
export const FailedMessageActionsMenu = ({ message, peerId, className, openFailedPostponedMessageCalendarModal, }) => {
    const { lang, analyticsAppName, analyticsOrigin } = useBrowserEnv();
    const convo = useConvo(peerId);
    const dispatch = useDispatch();
    const isPostponed = !!message.isPostponed;
    const failedMsgsCount = useMemo(() => isPostponed
        ? Convo.getPostponedConvoFailedMessagesCount(convo)
        : Convo.getConvoFailedMessagesCount(convo), [convo, isPostponed]);
    const menuItemClickHandler = useCallback((actionId) => {
        switch (actionId) {
            case 'deleteFailedMessage': {
                dispatch({
                    type: 'UserDeleteFailedMessage',
                    randomId: message.randomId,
                    peerId,
                    userAction: 'delete',
                    isPostponed,
                });
                break;
            }
            case 'deleteAllFailedMessage': {
                dispatch({
                    type: 'UserDeleteAllFailedMessages',
                    peerId,
                    isPostponed,
                    userAction: 'delete',
                });
                break;
            }
            case 'resendFailedMessage': {
                dispatch({
                    type: 'UserHitResendFailedMessage',
                    peerId,
                    randomId: message.randomId,
                    analyticsAppName,
                    analyticsOrigin,
                    isPostponed,
                });
                break;
            }
            case 'resendAllFailedMessage': {
                dispatch({
                    type: 'UserHitResendAllFailedMessages',
                    peerId,
                    analyticsAppName,
                    analyticsOrigin,
                    isPostponed,
                });
                break;
            }
            case 'changePostponedMessageTime': {
                openFailedPostponedMessageCalendarModal();
                break;
            }
            default:
                break;
        }
    }, [
        dispatch,
        message.randomId,
        peerId,
        isPostponed,
        analyticsAppName,
        analyticsOrigin,
        openFailedPostponedMessageCalendarModal,
    ]);
    const actionsList = useMemo(() => (React.createElement(React.Fragment, null,
        React.createElement(ActionsMenuAction, { onClick: () => menuItemClickHandler('resendFailedMessage'), title: lang.use('me_resend'), leftIcon: React.createElement(Icon20ArrowUpOutline, null), type: "secondary" }),
        failedMsgsCount > 1 && (React.createElement(ActionsMenuAction, { onClick: () => menuItemClickHandler('resendAllFailedMessage'), title: `${lang.use('me_resend')} (${failedMsgsCount})`, leftIcon: React.createElement(Icon20ArrowUpOutline, null), type: "secondary" })),
        isPostponed && (React.createElement(ActionsMenuAction, { leftIcon: React.createElement(Icon20RecentOutline, null), title: lang.use('me_message_action_change_sending_time'), onClick: () => menuItemClickHandler('changePostponedMessageTime'), type: "secondary" })),
        React.createElement(CommonCopySelectionAction, null),
        React.createElement(CommonCopyMessageTextAction, { chunks: message.chunks }),
        React.createElement(ActionsMenuAction, { onClick: () => menuItemClickHandler('deleteFailedMessage'), title: lang.use('me_message_action_delete'), leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger" }),
        failedMsgsCount > 1 && (React.createElement(ActionsMenuAction, { onClick: () => menuItemClickHandler('deleteAllFailedMessage'), title: `${lang.use('me_message_action_delete')} (${failedMsgsCount})`, leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger" })))), [lang, failedMsgsCount, isPostponed, message.chunks, menuItemClickHandler]);
    return React.createElement(ActionsMenu, { className: className }, actionsList);
};
//# sourceMappingURL=FailedMessageActionsMenu.js.map