import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, BlinkText, InterpunctSeparator } from '@vkontakte-internal/vkcom-kit';
import { copyTextToClipboard } from '@vkontakte/vkjs';
export const ListCopyControl = ({ value, copyText, doneText }) => {
    const [isDoneTextShown, setDoneTextShown] = useState(false);
    const handleCopyButton = (e) => {
        e.stopPropagation();
        copyTextToClipboard(value).then(() => setDoneTextShown(true));
    };
    const handleDoneTextHide = () => setDoneTextShown(false);
    return (_jsxs("span", { children: [_jsx(InterpunctSeparator, {}), _jsx(Button, { onClick: handleCopyButton, disabled: isDoneTextShown, "data-testid": "calls_call_management_modal_link_copy", mode: "link", children: isDoneTextShown ? (_jsx(BlinkText, { shown: isDoneTextShown, onHide: handleDoneTextHide, children: doneText })) : (copyText) })] }));
};
//# sourceMappingURL=ListCopyControl.js.map