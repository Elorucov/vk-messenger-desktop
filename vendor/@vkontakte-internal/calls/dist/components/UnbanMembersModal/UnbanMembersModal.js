import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
import { CallUsersStack } from '../CallUsersStack';
export const UnbanMembersModal = ({ onClose, actionButtons, description, subDescription, avatarsItems, }) => {
    const { getLang } = useLang();
    return (_jsx(CallsModal, { className: "UnbanMembersModal", title: getLang('calls_unban_participant_title'), actionButtons: actionButtons, onClose: onClose, description: description, children: _jsxs("div", { className: "UnbanMembersModal__content", children: [_jsx(CallUsersStack, { items: avatarsItems, size: 50 }), _jsx("div", { className: "UnbanMembersModal__description", children: description }), _jsx("div", { className: "UnbanMembersModal__subDescription", children: subDescription })] }) }));
};
//# sourceMappingURL=UnbanMembersModal.js.map