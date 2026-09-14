import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { IconButton, TextTooltip } from '@vkontakte-internal/vkcom-kit';
export function Button({ tooltip, onClick, placement, ariaLabel, children, ...rest }) {
    const ref = useRef(null);
    const handleClick = () => {
        ref.current?.blur();
        onClick?.();
    };
    return (_jsx(TextTooltip, { text: tooltip, placement: placement, children: _jsx(IconButton, { getRootRef: ref, size: 36, label: ariaLabel || tooltip || '', onClick: handleClick, ...rest, children: children }) }));
}
//# sourceMappingURL=Button.js.map