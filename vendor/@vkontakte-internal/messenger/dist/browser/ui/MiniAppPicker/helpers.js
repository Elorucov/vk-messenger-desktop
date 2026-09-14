import React from 'react';
import { Button, Paragraph, Subhead } from '@vkontakte/vkui';
import { Icon24CheckCircleOn, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { MAX_INT32 } from '../../../core/config/config';
import { getOwnerGroupId } from '../../../data/store/State';
import * as MiniApp from '../../../core/model/MiniApp';
export const sendWidgetToChats = ({ apiFetch, apiFetchMany, app, payload, peers, owner, appName, }) => {
    const { actionTitle, actionHash } = payload;
    const { id } = app;
    const template = {
        type: 'app_action',
        app_id: id,
        title: actionTitle,
        hash: actionHash,
    };
    /*
      Реализовано на текущем этапе без UserHitSend,
      т.к. используются бридж методы миниприложений.
      random_id положительный
    */
    const sendParams = {
        random_id: Math.floor(Math.random() * MAX_INT32),
        template: JSON.stringify(template),
        group_id: getOwnerGroupId(owner.id),
    };
    if (peers.length === 1) {
        return apiFetch('messages.send', {
            ...sendParams,
            peer_id: peers[0],
            from: appName,
        });
    }
    else {
        return apiFetchMany(peers.map((peerId) => ({
            method: 'messages.send',
            params: {
                ...sendParams,
                peer_id: peerId,
                from: appName,
            },
        })));
    }
};
export const getSnackbarProps = ({ success, lang, closeParent, repeatAction, onManualClose, errorMessage, }) => {
    const commonProps = {
        message: success ? (lang.use('me_miniapps_picker_success_snackbar_title')) : (React.createElement("div", null,
            React.createElement(Paragraph, null, lang.use('me_miniapps_picker_fail_snackbar_title')),
            React.createElement(Subhead, { style: {
                    color: 'var(--vkui--color_text_subhead)',
                } }, lang.use('me_miniapps_picker_fail_snackbar_subtitle')))),
        before: success ? (React.createElement(Icon24CheckCircleOn, { fill: "var(--vkui--color_icon_accent)" })) : (React.createElement(Icon24ErrorCircleOutline, { fill: "var(--vkui--color_icon_negative)" })),
        autoClose: success,
        isManuallyClosable: !success,
    };
    if (success) {
        return {
            ...commonProps,
            action: closeParent && lang.use('me_miniapps_picker_success_snackbar_action'),
            onActionClick: closeParent,
        };
    }
    return {
        ...commonProps,
        after: repeatAction && (React.createElement(Button, { size: "s", mode: "tertiary", onClick: repeatAction }, lang.use('me_miniapps_picker_snackbar_repeat'))),
        onClose: () => onManualClose && errorMessage && onManualClose(errorMessage),
    };
};
export const createSendToChatError = (apiError) => {
    const errorType = apiError ? 'api_error' : 'client_error';
    const errorInfo = {
        error_code: apiError
            ? MiniApp.BridgeErrorCodes.UNKNOWN
            : MiniApp.BridgeErrorCodes.USER_DENIED,
        error_msg: apiError
            ? apiError
            : MiniApp.BridgeErrorReasons.USER_DENIED,
    };
    return [errorType, errorInfo];
};
//# sourceMappingURL=helpers.js.map