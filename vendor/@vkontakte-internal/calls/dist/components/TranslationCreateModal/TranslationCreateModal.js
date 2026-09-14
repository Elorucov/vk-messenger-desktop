import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { Children } from 'react';
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
import { Button, ButtonGroup } from '@vkontakte-internal/vkcom-kit';
export function TranslationCreateModal(props) {
    const { onClose, onSubmit, title, children, isWithBackButton, onBackClick, contentClassName = 'TranslationCreateModal__content', isRecord, } = props;
    const { getLang } = useLang();
    const needActionButtons = onClose && onSubmit;
    const actionButtons = needActionButtons && (_jsxs(ButtonGroup, { children: [_jsx(Button, { size: "m", onClick: onClose, mode: "tertiary", "data-testid": `calls_${isRecord ? 'record' : 'translation'}_modal_cancel_button`, children: getLang('calls_cancel') }), _jsx(Button, { mode: "primary", size: "m", onClick: onSubmit, "data-testid": `calls_${isRecord ? 'record' : 'translation'}_modal_start_button`, children: isRecord ? getLang('calls_record_start') : getLang('calls_translation_start') })] }));
    return (_jsx(CallsModal, { className: "TranslationCreateModal", title: title, onClose: onClose, backText: isWithBackButton ? getLang('calls_back') : undefined, onBack: onBackClick, actionButtons: actionButtons, dataTestId: `calls_${isRecord ? 'record' : 'translation'}_modal_root`, children: _jsx("div", { className: contentClassName, children: Children.toArray(children).map((child, index) => (_jsx("div", { className: "CallManagementModal__section", children: child }, index))) }) }));
}
//# sourceMappingURL=TranslationCreateModal.js.map