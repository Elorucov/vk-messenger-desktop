import '../../ui/MessageOutStatusIcon/MessageOutStatusIcon.css';
import cx from 'classnames';
import React from 'react';
import * as Message from '../../../core/model/Message';
import { Icon12ClockOutline, Icon12ErrorCircleFill, Icon16CheckDoubleOutline, Icon16CheckOutline, } from '@vkontakte/icons';
import { exhaustivenessCheck } from '../../../core/utils/misc';
import { useBrowserEnv } from '../../hooks/misc';
export const MessageOutStatusIcon = ({ type, className, sendingIcon = React.createElement(Icon12ClockOutline, null), sendingIconColor, readIconColor, }) => {
    const { lang } = useBrowserEnv();
    switch (type) {
        case 'failed': {
            return (React.createElement("div", { className: cx('MessageOutStatusIcon__failed', className) },
                React.createElement(Icon12ErrorCircleFill, { "aria-hidden": false, "aria-label": lang.use('me_message_sending_failed') })));
        }
        case 'pending': {
            return (React.createElement("div", { className: cx('MessageOutStatusIcon__sending', className), style: { color: sendingIconColor }, role: "img", "aria-label": lang.use('me_message_sending') }, sendingIcon));
        }
        case 'read': {
            return (React.createElement("div", { className: className, style: { color: readIconColor } },
                React.createElement(Icon16CheckDoubleOutline, null)));
        }
        case 'sent': {
            return (React.createElement("div", { className: className, style: { color: readIconColor } }, React.createElement(Icon16CheckOutline, null)));
        }
        default:
            exhaustivenessCheck(type);
    }
};
export const getMessageOutStatusIconType = (message, isUnread) => {
    const msgKind = message.kind;
    switch (msgKind) {
        case 'Normal':
        case 'Queued': {
            if (!message.isOut) {
                return null;
            }
            if (Message.isFailed(message)) {
                return 'failed';
            }
            const isPending = msgKind === 'Queued'
                ? !message.cmid
                : message.editing?.status === 'pending';
            if (isPending) {
                return 'pending';
            }
            /**
             * Граница прочитанности (до какого сmid прочитанно) не относится к истории отложенных сообщений.
             * Cmid отложек не уникальны и могут пересекаться с сmid обычных сообщений и определять прочитанность isUnread
             * нельзя, вообще все отложки не прочитаны априори.
             */
            if (message.isPostponed) {
                return 'sent';
            }
            return isUnread ? 'sent' : 'read';
        }
        case 'Expired':
        case 'Service':
            return null;
        default:
            exhaustivenessCheck(msgKind);
    }
};
//# sourceMappingURL=MessageOutStatusIcon.js.map