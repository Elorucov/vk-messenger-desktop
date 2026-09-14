import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}],"Icon56HelpOutline":["@vkontakte/icons",{"className":1}],"h3":["global",{"className":1}],"p":["global",{"className":1}]} */
import { Button } from '@vkontakte-internal/vkcom-kit';
import { BaseModal } from '../../../../components/BaseModal/BaseModal';
import { useCloseModal } from '../../../../hooks/useCloseModal';
import { Icon56HelpOutline } from '@vkontakte/icons';
import { useLang } from '../../../../hooks/useLang';
import styles from './RoomRequestHelpModal.module.css';
export const RoomRequestHelpModal = ({ onClick }) => {
    const { getLang } = useLang();
    const onClose = useCloseModal();
    return (_jsx(BaseModal, { className: styles.modal, onClose: onClose, enableCrossButton: true, disableBodyScroll: true, children: _jsxs("div", { className: styles.wrap, "data-testid": "calls_rooms_request_help", children: [_jsx(Icon56HelpOutline, { className: styles.icon }), _jsx("h3", { className: styles.title, children: getLang('calls_rooms_modal_request_help_title') }), _jsx("p", { className: styles.subheader, children: getLang('calls_rooms_modal_request_help_body') }), _jsx(Button, { size: "m", onClick: onClick, "data-testid": "calls_rooms_request_help_btn", children: getLang('calls_rooms_modal_request_help_button') })] }) }));
};
//# sourceMappingURL=RoomRequestHelpModal.js.map