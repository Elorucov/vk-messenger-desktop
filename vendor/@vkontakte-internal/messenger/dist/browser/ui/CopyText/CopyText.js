import { copyTextToClipboard } from '@vkontakte/vkjs';
import '../../ui/CopyText/CopyText.css';
import React, { useRef, useCallback } from 'react';
export const CopyText = ({ text, stopPropagation = true, onCopyDone, children, }) => {
    const inputRef = useRef(null);
    const copyText = useCallback((e) => {
        e.preventDefault();
        if (stopPropagation) {
            e.stopPropagation();
        }
        copyTextToClipboard(text).then(() => onCopyDone?.());
    }, [onCopyDone, text, stopPropagation]);
    return (React.createElement("div", { className: "CopyText", onClick: copyText },
        React.createElement("input", { tabIndex: -1, "aria-hidden": true, type: "text", readOnly: true, value: text || '', ref: inputRef, className: "CopyText__input" }),
        children));
};
//# sourceMappingURL=CopyText.js.map