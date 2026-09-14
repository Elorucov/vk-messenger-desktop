import React from 'react';
import { Icon16CheckDoubleOutline, Icon16CheckOutline } from '@vkontakte/icons';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import * as Message from '../../../core/model/Message';
import './MessageOutStatusIconHint.css';
export const MessageOutStatusIconHint = ({ message }) => {
    let key;
    switch (true) {
        case Message.isFailed(message): {
            if (message.kind === 'Normal' && message.editing?.status === 'failed') {
                key = 'me_message_edit_failed_tooltip';
                break;
            }
            else {
                key = 'me_message_send_failed_tooltip';
                break;
            }
        }
        case message.kind === 'Queued' && !message.cmid:
        case message.kind === 'Normal' && message.editing?.status === 'pending':
            key = 'me_message_queued_tooltip';
            break;
        default:
            key = 'me_message_read_status_tooltip';
            break;
    }
    return (React.createElement(FormattedLangKey, { langkey: key, values: {
            unreadIcon: (React.createElement(Icon16CheckOutline, { className: "MessageOutStatusIconHint__icon" })),
            readIcon: (React.createElement(Icon16CheckDoubleOutline, { className: "MessageOutStatusIconHint__icon" })),
        } }));
};
//# sourceMappingURL=MessageOutStatusIconHint.js.map