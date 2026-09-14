import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { BaseModal } from '../../palette/BaseModal/BaseModal';
import { useLang } from '../../hooks/useLang';
import { Button } from '@vkontakte-internal/vkcom-kit';
export const TranslationStartCountdownModal = ({ onCloseModal, counter, onStopTranslation, isRecord, }) => {
    const { getLang } = useLang();
    const textButtonCancel = isRecord
        ? getLang('calls_record_cancel_button')
        : getLang('calls_translation_cancel_button');
    return (_jsx(BaseModal, { disableBackdropClick: true, className: "TranslationStartCountdownModal", onClose: onCloseModal, children: _jsxs("div", { className: "TranslationStartCountdownModal__content", children: [_jsx("div", { className: "TranslationStartCountdownModal__counter", children: counter }), _jsx(Button, { size: "m", onClick: onStopTranslation, mode: "secondary", appearance: "overlay", children: textButtonCancel })] }) }));
};
//# sourceMappingURL=TranslationStartCountdownModal.js.map