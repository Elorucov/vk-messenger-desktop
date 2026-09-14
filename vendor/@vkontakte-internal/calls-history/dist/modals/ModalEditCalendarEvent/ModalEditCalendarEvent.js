import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useCallsBridge } from '@vkontakte-internal/calls-core';
import { useEffect } from 'react';
export function ModalEditCalendarEvent(props) {
    const bridge = useCallsBridge();
    useEffect(() => {
        bridge?.setEditCalendarEvent?.(props);
    }, [bridge, props]);
    return _jsx(_Fragment, {});
}
//# sourceMappingURL=ModalEditCalendarEvent.js.map