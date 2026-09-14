import { useBrowserEnv, useViewer } from '../../hooks/misc';
import React from 'react';
import { FormattedLangKey } from '../../ui/FormattedLangKey/FormattedLangKey';
import { ModalWindow } from '../../ui/ModalWindow/ModalWindow';
import * as Viewer from '../../../core/model/Viewer';
import './FailedPhoneNumbers.css';
export const FailedPhoneNumbersModal = ({ onClose, phoneNumbers, }) => {
    const { lang } = useBrowserEnv();
    const viewer = useViewer();
    const isEdu = Viewer.isEdu(viewer.profileType);
    const title = isEdu
        ? lang.use('me_chat_invite_sms_failed_title')
        : lang.use('me_failed_phone_modal_title');
    return (React.createElement(ModalWindow, { onClose: onClose, closeLabel: lang.use('me_close'), title: title, withCustomLayout: true, panelClass: "FailedPhoneNumbersModal" },
        React.createElement("div", { className: "FailedPhoneNumbersModal__header" },
            React.createElement("h3", { className: "FailedPhoneNumbersModal__title" }, title)),
        React.createElement("div", { className: "FailedPhoneNumbersModal__content" },
            React.createElement(FormattedLangKey, { langkey: "me_chat_invite_sms_failed_text", values: {
                    phones: phoneNumbers?.join(', ') ?? '',
                } }))));
};
//# sourceMappingURL=FailedPhoneNumbers.js.map