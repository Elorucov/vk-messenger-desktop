import { jsx as _jsx } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":1}]} */
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
export const TranslationStopModal = ({ onClose, actionButtons, isRecord }) => {
    const { getLang } = useLang();
    const title = isRecord
        ? getLang('calls_record_stop_confirmation')
        : getLang('calls_translation_stop_confirmation');
    const description = isRecord ? getLang('calls_record_stop_sure') : getLang('calls_translation_stop_sure');
    return (_jsx(CallsModal, { onClose: onClose, title: title, actionButtons: actionButtons, className: "TranslationStopModal", description: description, dataTestId: "calls_translation_stop_modal_root", children: _jsx("div", { className: "TranslationStopModal__content", children: description }) }));
};
//# sourceMappingURL=TranslationStopModal.js.map