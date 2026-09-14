import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* lock-restricted-props: {"div":["global",{"className":2}]} */
import { useCallback, useState } from 'react';
import { BlinkText, Button, FormItem, InputStub, Spinner, Input } from '@vkontakte-internal/vkcom-kit';
import { useLang } from '../../hooks/useLang';
import { copyTextToClipboard } from '@vkontakte/vkjs';
export const TranslationLink = ({ link, isLoading }) => {
    const { getLang } = useLang();
    const [isLinkCopied, setLinkCopied] = useState(false);
    const hideCopiedText = useCallback(() => setLinkCopied(false), []);
    const handleCopyButton = () => {
        link && copyTextToClipboard(link).then(() => setLinkCopied(true));
    };
    return (_jsxs("div", { className: "TranslationLink", children: [_jsx(FormItem, { top: getLang('calls_translation_link_info'), children: isLoading ? (_jsx(InputStub, { before: _jsx(Spinner, { size: "small" }), "data-testid": "calls_translation_link_stub" })) : (_jsx(Input, { readOnly: true, value: link, "data-testid": "calls_translation_link_input" })) }), link && (_jsx(FormItem, { children: _jsx(Button, { onClick: handleCopyButton, mode: "primary", size: "m", "data-testid": "calls_translation_button_copy", children: getLang('calls_translation_link_copy') }) })), _jsx("div", { className: "TranslationLink__copied", children: _jsx(BlinkText, { shown: isLinkCopied, onHide: hideCopiedText, children: getLang('calls_translation_link_copied') }) })] }));
};
//# sourceMappingURL=TranslationLink.js.map