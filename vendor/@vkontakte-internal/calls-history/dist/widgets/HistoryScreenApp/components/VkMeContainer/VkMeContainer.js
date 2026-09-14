import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { noop } from '@vkontakte/vkjs';
import { HistoryScreenRouter } from '../../../HistoryScreenRouter';
import { CallsEventType, ModalBackdrop, ModalPortalToBody, useCallsBridge, } from '@vkontakte-internal/calls-core';
import { ModalBody, ModalBox, ModalHeader, ModalScrollView } from '@vkontakte-internal/vkcom-kit';
export const VkMeContainer = (props) => {
    const { onClose, title, startedSection } = props;
    const bridge = useCallsBridge();
    const handleModalClose = () => {
        onClose();
    };
    useEffect(() => () => {
        bridge.eventBus.emit(CallsEventType.HISTORY_MODAL_CLOSED);
    }, []);
    return (_jsx(ModalPortalToBody, { children: _jsx(ModalBackdrop, { onClose: handleModalClose, children: _jsxs(ModalBox, { "aria-label": "VK Calls Modal", stretched: true, children: [_jsx(ModalHeader, { closeAriaLabel: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", onClose: handleModalClose, children: title }), _jsx(ModalScrollView, { height: "calc(100vh - 54px)", children: _jsx(ModalBody, { insetLevel: 2, children: _jsx(HistoryScreenRouter, { startedSection: startedSection, changeQuery: noop }) }) })] }) }) }));
};
//# sourceMappingURL=VkMeContainer.js.map