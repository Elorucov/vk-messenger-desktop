import React, { useCallback } from 'react';
import { useBrowserEnv, useDispatch } from '../../hooks/misc';
import { Icon20DeleteOutline, Icon20ArrowUpOutline } from '@vkontakte/icons';
import { CommonCopySelectionAction } from '../../ui/MessageActionsMenu/CommonCopySelectionAction';
import { CommonCopyMessageTextAction } from '../../ui/MessageActionsMenu/CommonCopyMessageTextAction';
import { ActionsMenu, ActionsMenuAction, } from '../../ui/ActionsMenu/ActionsMenu';
export const FailedEditedMessageActionsMenu = ({ message, className }) => {
    const { lang } = useBrowserEnv();
    const dispatch = useDispatch();
    const menuItemClickHandler = useCallback((actionId) => {
        const { cmid, peerId } = message;
        switch (actionId) {
            case 'cancelEditingMessage': {
                if (message.isPostponed) {
                    dispatch({
                        type: 'UserHitEditPostponed_CancelFailedEditing',
                        peerId,
                        cmid,
                    });
                }
                else {
                    dispatch({
                        type: 'UserHitEdit_CancelFailedEditing',
                        peerId,
                        cmid,
                    });
                }
                break;
            }
            case 'resendFailedEditedMessage': {
                if (message.isPostponed) {
                    dispatch({
                        type: 'UserHitEditPostponed_Resend',
                        cmid,
                        peerId,
                    });
                }
                else {
                    dispatch({
                        type: 'UserHitEdit_Resend',
                        cmid,
                        peerId,
                    });
                }
                break;
            }
            default:
                break;
        }
    }, [dispatch, message]);
    return (React.createElement(ActionsMenu, { className: className },
        React.createElement(ActionsMenuAction, { onClick: () => menuItemClickHandler('resendFailedEditedMessage'), title: lang.use('me_resend'), leftIcon: React.createElement(Icon20ArrowUpOutline, null), type: "secondary" }),
        React.createElement(CommonCopySelectionAction, null),
        React.createElement(CommonCopyMessageTextAction, { chunks: message.chunks }),
        React.createElement(ActionsMenuAction, { onClick: () => menuItemClickHandler('cancelEditingMessage'), title: lang.use('me_cancel_editing'), leftIcon: React.createElement(Icon20DeleteOutline, null), type: "danger" })));
};
//# sourceMappingURL=FailedEditedMessageActionsMenu.js.map