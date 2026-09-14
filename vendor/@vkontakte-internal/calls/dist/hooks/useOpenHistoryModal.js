import { CallsEventType, useCallsBridge, HistoryScreenSections } from '@vkontakte-internal/calls-core';
export const useOpenHistoryModal = () => {
    const bridge = useCallsBridge();
    const openHistoryModal = () => {
        bridge.eventBus.emit(CallsEventType.OPEN_HISTORY_MODAL, { section: HistoryScreenSections.DECODING });
        bridge.collapseCall();
    };
    return {
        openHistoryModal,
    };
};
//# sourceMappingURL=useOpenHistoryModal.js.map