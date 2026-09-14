import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsModal } from '../../components/CallsModal';
import { classNames as cx } from '@vkontakte/vkjs';
export const MuteControlModal = ({ title, description, onClose, actionButtons, descriptionIsLite, isAlertDialog, }) => {
    const modalClassname = cx('MuteControlModal', {
        MuteControlModal__withoutContent: !Boolean(description),
    });
    const contentClassname = cx('MuteControlModal__content', {
        'MuteControlModal__content--lite': descriptionIsLite,
    });
    return (_jsx(CallsModal, { className: modalClassname, title: title, actionButtons: actionButtons, onClose: onClose, description: description, isAlertDialog: isAlertDialog, children: description && _jsx("div", { className: contentClassname, children: description }) }));
};
//# sourceMappingURL=MuteControlModal.js.map