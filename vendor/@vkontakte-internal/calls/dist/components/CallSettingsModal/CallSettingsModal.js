import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@vkontakte-internal/vkcom-kit';
import { CallsModal } from '../../components/CallsModal';
import { useLang } from '../../hooks/useLang';
export function CallSettingsModal({ onClose, onSubmit, children }) {
    const { getLang } = useLang();
    const [loading, setLoading] = useState(false);
    const handleSubmit = () => {
        setLoading(true);
        onSubmit().finally(() => setLoading(false));
    };
    return (_jsx(CallsModal, { onClose: onClose, title: getLang('calls_call_menu_settings'), actionButtons: _jsxs(_Fragment, { children: [_jsx(Button, { "data-testid": "calls_media_settings_cancel", size: "m", onClick: onClose, mode: "tertiary", children: getLang('calls_cancel') }), _jsx(Button, { "data-testid": "calls_media_settings_save", size: "m", mode: "primary", onClick: handleSubmit, loading: loading, children: getLang('calls_save') })] }), className: "CallSettingsModal", dataTestId: "calls_media_settings_modal_root", children: children }));
}
//# sourceMappingURL=CallSettingsModal.js.map