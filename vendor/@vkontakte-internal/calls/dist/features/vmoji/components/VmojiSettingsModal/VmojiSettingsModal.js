import { jsx as _jsx } from "react/jsx-runtime";
import { CallsModal } from '../../../../components/CallsModal';
import { useLang } from '../../../../hooks/useLang';
export const VmojiSettingsModal = ({ onClose, children }) => {
    const { getLang } = useLang();
    return (_jsx(CallsModal, { onClose: onClose, title: getLang('calls_vmoji'), className: "VmojiSettingsModal", children: children }));
};
//# sourceMappingURL=VmojiSettingsModal.js.map